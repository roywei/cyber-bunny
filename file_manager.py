"""
Assistant file manger utility
modified from: https://community.openai.com/t/deleting-everything-in-storage/664945/2
"""
from openai import OpenAI
import datetime

# Initialize the OpenAI client
client = OpenAI()

def upload_file():
    filename = input("Enter the filename to upload: ")
    try:
        with open(filename, "rb") as file:
            response = client.files.create(file=file, purpose="assistants")
            print(response)
            print(f"File uploaded successfully: {response.filename} [{response.id}]")
    except FileNotFoundError:
        print("File not found. Please make sure the filename and path are correct.")

def list_files():
    response = client.files.list(purpose="assistants")
    if len(response.data) == 0:
        print("No files found.")
        return
    for file in response.data:
        created_date = datetime.datetime.utcfromtimestamp(file.created_at).strftime('%Y-%m-%d')
        print(f"{file.filename} [{file.id}], Created: {created_date}")

def list_and_delete_file():
    while True:
        response = client.files.list(purpose="assistants")
        files = list(response.data)
        if len(files) == 0:
            print("No files found.")
            return
        for i, file in enumerate(files, start=1):
            created_date = datetime.datetime.utcfromtimestamp(file.created_at).strftime('%Y-%m-%d')
            print(f"[{i}] {file.filename} [{file.id}], Created: {created_date}")
        choice = input("Enter a file number to delete, or any other input to return to menu: ")
        if not choice.isdigit() or int(choice) < 1 or int(choice) > len(files):
            return
        selected_file = files[int(choice) - 1]
        client.files.delete(selected_file.id)
        print(f"File deleted: {selected_file.filename}")

def delete_all_files():
    confirmation = input("This will delete all OpenAI files with purpose 'assistants'.\n Type 'YES' to confirm: ")
    if confirmation == "YES":
        response = client.files.list(purpose="assistants")
        for file in response.data:
            client.files.delete(file.id)
        print("All files with purpose 'assistants' have been deleted.")
    else:
        print("Operation cancelled.")

# delete all files with given name
def delete_files_by_name(name):
    response = client.files.list(purpose="assistants")
    for file in response.data:
        if file.filename == name:
            client.files.delete(file.id)
            print(f"File deleted: {file.filename}")

def download_file_with_prefix(prefix):
    response = client.files.list(purpose="assistants")
    for file in response.data:
        if file.filename.startswith(prefix):
            file_data = client.files.content(file.id)
            file_data_bytes = file_data.read()
            with open(file.filename, "wb") as f:
                f.write(file_data_bytes)
            print(f"File downloaded: {file.filename}")

def main():
    while True:
        print("\n== Assistants file utility ==")
        print("[1] Upload file")
        print("[2] List all files")
        print("[3] List all and delete one of your choice")
        print("[4] Delete all assistant files (confirmation required)")
        print("[5] Delete all assistant files with given name")
        print("[6] Download file with prefix")
        print("[9] Exit")
        choice = input("Enter your choice: ")

        if choice == "1":
            upload_file()
        elif choice == "2":
            list_files()
        elif choice == "3":
            list_and_delete_file()
        elif choice == "4":
            delete_all_files()
        elif choice == "5":
            name = input("Enter the name of the file you want to delete: ")
            delete_files_by_name(name)
        elif choice == "6":
            prefix = input("Enter the prefix of the file you want to download: ")
            download_file_with_prefix(prefix)
        elif choice == "9":
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()