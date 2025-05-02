# train.py
import argparse
import logging
import os
from dataclasses import dataclass

import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
)
from peft import LoraConfig, get_peft_model, TaskType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ScriptArgs:
    model_name_or_path: str
    train_file: str
    validation_file: str
    output_dir: str
    batch_size: int
    micro_batch_size: int
    num_epochs: int
    learning_rate: float
    lora_r: int
    lora_alpha: int
    lora_dropout: float = 0.05
    max_seq_length: int = 512

def parse_args() -> ScriptArgs:
    p = argparse.ArgumentParser()
    p.add_argument("--model_name_or_path", required=True)
    p.add_argument("--train_file",            required=True)
    p.add_argument("--validation_file",       required=True)
    p.add_argument("--output_dir",            required=True)
    p.add_argument("--batch_size",    type=int, default=4)
    p.add_argument("--micro_batch_size", type=int, default=1)
    p.add_argument("--num_epochs",     type=int, default=3)
    p.add_argument("--learning_rate",  type=float, default=2e-4)
    p.add_argument("--lora_r",         type=int, default=8)
    p.add_argument("--lora_alpha",     type=int, default=16)
    p.add_argument("--lora_dropout",   type=float, default=0.05)
    p.add_argument("--max_seq_length", type=int, default=512)
    args = p.parse_args()
    return ScriptArgs(**vars(args))

def preprocess_examples(examples, tokenizer, max_seq_length):
    inputs, labels = [], []
    for mode, target, inp, out in zip(
        examples["mode"], examples["target"], examples["input"], examples["output"]
    ):
        # Build the prompt string
        prompt = f"MODE: {mode}\nTARGET: {target}\nPROMPT: {inp}\n\nREWRITE:"
        full = prompt + " " + out
        tok = tokenizer(
            full,
            truncation=True,
            max_length=max_seq_length,
            padding="max_length",
        )
        input_ids = tok["input_ids"]
        # for causal LM, labels = input_ids
        inputs.append(input_ids)
        labels.append(input_ids.copy())
    return {"input_ids": inputs, "labels": labels}

def main():
    args = parse_args()

    # load tokenizer & model
    tokenizer = AutoTokenizer.from_pretrained(args.model_name_or_path, use_fast=True)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        args.model_name_or_path,
        device_map="auto",
        load_in_8bit=False  # set True if you have >40GB GPU
    )

    # apply LoRA
    peft_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False,
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
    )
    model = get_peft_model(model, peft_config)

    # load datasets
    data_files = {"train": args.train_file, "validation": args.validation_file}
    ds = load_dataset("json", data_files=data_files)

    # preprocess
    ds = ds.map(
        lambda ex: preprocess_examples(ex, tokenizer, args.max_seq_length),
        batched=True,
        remove_columns=ds["train"].column_names,
    )

    data_collator = DataCollatorForLanguageModeling(tokenizer, mlm=False)

    # compute gradient accumulation
    gradient_accumulation_steps = args.batch_size // args.micro_batch_size

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.micro_batch_size,
        per_device_eval_batch_size=args.micro_batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        evaluation_strategy="steps",
        eval_steps=200,
        logging_steps=100,
        num_train_epochs=args.num_epochs,
        learning_rate=args.learning_rate,
        fp16=torch.cuda.is_available(),
        save_total_limit=2,
        save_steps=500,
        load_best_model_at_end=True,
        report_to="none",  # disable WandB/others
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=ds["train"],
        eval_dataset=ds["validation"],
        data_collator=data_collator,
        tokenizer=tokenizer,
    )

    trainer.train()
    # save the LoRA adapter
    model.save_pretrained(args.output_dir)
    logger.info(f"LoRA adapter and config saved to {args.output_dir}")

if __name__ == "__main__":
    main()
