

import config
from flask import Flask, jsonify
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import requests
import json

API_TOKEN = "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"
headers = {"Authorization": f"Bearer {API_TOKEN}"}
API_URL = "https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english"

def query(payload):
    data = json.dumps(payload)
    response = requests.request("POST", API_URL, headers=headers, data=data)
    return json.loads(response.content.decode("utf-8"))


def token_classification(LONG_ARTICLE):

    data = query({"inputs": LONG_ARTICLE})

    print("\n****** MODEL: bert-large-cased-finetuned-conll03-english ******\n")
    print(data)
    print("\n")

def summarize_text(LONG_ARTICLE):

    # Initialize summarization pipeline0
    tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
    model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-large-cnn")
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)

    summary = ""

    for i in range(0, len(LONG_ARTICLE), 512):

        # Split long text into chunks of size 512
        chunk = LONG_ARTICLE[i:i+512]

        # Dynamically calculate max_length based on input_length
        input_length = len(chunk)

        # Set max_length as 150% of input_length, with a maximum limit of 1024
        max_length = min(int(input_length * 1.5), 1024)

        result = summarizer(chunk, max_length=max_length,
                            min_length=40, do_sample=False)
        if len(result) > 0:
            summary += result[0]["summary_text"] + " "

        config.progress += 1

    return summary
