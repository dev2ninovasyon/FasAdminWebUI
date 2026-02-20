import os

root_dir = r"c:\Users\lenov\source\FasAdminWebUI\src\app\(AdminUI)"
old_str = "@/app/(Uygulama)/"
new_str = "@/app/(AdminUI)/"

for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            filepath = os.path.join(subdir, file)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                if old_str in content:
                    print(f"Fixing {filepath}")
                    new_content = content.replace(old_str, new_str)
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
            except Exception as e:
                print(f"Error processing {filepath}: {e}")
