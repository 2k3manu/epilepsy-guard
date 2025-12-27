import opendatasets as od
import os

dataset_url = "https://www.kaggle.com/datasets/kushalavakavuri/seizure-detection-with-physiological-data"

print("Attempting to download dataset from Kaggle...")
print("If prompted, please enter your Kaggle username and key.")
print("You can find these in your Kaggle account settings -> API -> Create New Token (it downloads a kaggle.json file).")

try:
    od.download(dataset_url, data_dir=".")
    print("Download complete.")
except Exception as e:
    print(f"Error downloading: {e}")
