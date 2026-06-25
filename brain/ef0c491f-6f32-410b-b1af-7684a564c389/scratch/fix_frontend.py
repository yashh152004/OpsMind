import os
import re

files_with_errors = [
    "src/pages/AiInsightsPage.tsx",
    "src/pages/AlertsPage.tsx",
    "src/pages/AnalyticsPage.tsx",
    "src/pages/DashboardPage.tsx",
    "src/pages/IncidentsPage.tsx",
    "src/pages/IntegrationsPage.tsx",
    "src/pages/LoginPage.tsx",
    "src/pages/RegisterPage.tsx",
    "src/pages/SecurityPage.tsx",
    "src/pages/SettingsPage.tsx"
]

def fix_file(filepath):
    print(f"Fixing {filepath}...")
    abs_path = os.path.join(r"d:\Project\frontend", filepath)
    if not os.path.exists(abs_path):
        return
        
    with open(abs_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Fix the extra </div> in specific files if not already fixed
    # (I already fixed them but maybe some missed)
    
    # 2. Add 'eslint-disable' or just remove unused imports?
    # Better to just remove the specific ones.
    
    # For now, I'll just do it manually with multi_replace for accuracy.

if __name__ == "__main__":
    pass
