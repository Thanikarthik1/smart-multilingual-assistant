from argostranslate import package, translate
import os

# List of language pairs to install
language_pairs = [("en", "hi"), ("hi", "en"), ("en", "te"), ("te", "en")]

# Create local directory to store downloaded packages
os.makedirs("argos_packages", exist_ok=True)

for from_code, to_code in language_pairs:
    print(f"🔍 Looking for model {from_code} → {to_code}")
    available_packages = package.get_available_packages()
    matching_packages = list(
        filter(lambda x: x.from_code == from_code and x.to_code == to_code, available_packages)
    )

    if not matching_packages:
        print(f"❌ No matching package found for {from_code} → {to_code}")
        continue

    selected_package = matching_packages[0]
    print(f"⬇ Downloading and installing {from_code} → {to_code}...")

    # Download package to file
    package_path = selected_package.download()
    
    # Install from path (old API method for 1.9.6)
    package.install_from_path(package_path)

print("✅ All language models installed successfully.")
