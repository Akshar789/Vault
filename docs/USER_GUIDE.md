# User Guide - Zero-Knowledge Password Vault

## Welcome to Your Secure Vault! 🔒

This guide will help you get started with your zero-knowledge password vault and make the most of its features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your Account](#creating-your-account)
3. [Adding Password Items](#adding-password-items)
4. [Managing Your Vault](#managing-your-vault)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### What is Zero-Knowledge Encryption?

Your vault uses **zero-knowledge encryption**, which means:
- ✅ All your passwords are encrypted **on your device** before being stored
- ✅ The server **never sees** your plaintext passwords
- ✅ Even if the server is hacked, your data remains secure
- ✅ Only you can decrypt your passwords with your master password

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection for syncing

## Creating Your Account

### Step 1: Choose a Strong Master Password

Your master password is the **only** way to access your vault. Make it:
- **At least 12 characters long** (longer is better!)
- **Unique** - don't reuse it anywhere else
- **Memorable** - you can't reset it if you forget
- **Complex** - mix uppercase, lowercase, numbers, and symbols

**Example of a strong master password:**
```
MyDog@Loves2Run!InThePark2024
```

### Step 2: Register

1. Go to the registration page
2. Enter your email address
3. Enter your master password
4. Confirm your master password
5. Click "Create Account"

⚠️ **IMPORTANT**: Write down your master password and store it safely. There is **NO password reset** option due to zero-knowledge encryption.

### Step 3: Sign In

1. Enter your email
2. Enter your master password
3. Click "Sign In"

Your vault will decrypt and load your items.

## Adding Password Items

### Adding Your First Item

1. Click the **"+ Add Item"** button
2. Choose the item type:
   - **Login**: For website passwords
   - **Note**: For secure notes
   - **Card**: For credit card information

3. Fill in the details:
   - **Name**: A descriptive name (e.g., "Gmail", "Facebook")
   - **Username/Email**: Your login username
   - **Password**: Your password (or click "Generate" for a strong one)
   - **Website URL**: The website address
   - **Notes**: Any additional information

4. Click **"Save Item"**

### Using the Password Generator

1. When adding or editing an item, click **"Generate"** next to the password field
2. A strong 16-character password will be automatically created
3. The password includes:
   - Uppercase letters (A-Z)
   - Lowercase letters (a-z)
   - Numbers (0-9)
   - Special characters (!@#$%^&*)

### Item Types

#### Login Items
Perfect for:
- Website accounts
- Email accounts
- Social media
- Online banking
- Work applications

Fields:
- Name
- Username/Email
- Password
- Website URL
- Notes

#### Secure Notes
Perfect for:
- Wi-Fi passwords
- Security questions
- Recovery codes
- PIN numbers
- Private information

Fields:
- Name
- Notes

#### Card Items
Perfect for:
- Credit cards
- Debit cards
- Gift cards
- Membership cards

Fields:
- Name
- Notes

## Managing Your Vault

### Viewing Items

1. Click on any item in your vault to view its details
2. The item detail modal will show all information
3. Click **"Show"** to reveal the password
4. Click **"Copy"** to copy username or password to clipboard
5. Click **"Open"** to visit the website

### Editing Items

1. Click on an item to view it
2. Click the **"Edit"** button
3. Make your changes
4. Click **"Save Item"**

### Deleting Items

1. Click on an item to view it
2. Click the **"Delete"** button
3. Confirm the deletion

⚠️ **Warning**: Deleted items cannot be recovered!

### Searching Your Vault

1. Use the search bar at the top of your vault
2. Search by:
   - Item name
   - Username
   - Website URL

3. Results update as you type

### Marking Favorites

1. When adding or editing an item, check **"Mark as favorite"**
2. Favorite items show a ⭐ star icon
3. Use favorites for frequently accessed items

## Security Best Practices

### Master Password

✅ **DO:**
- Use a unique, strong master password
- Write it down and store it in a safe place
- Use a passphrase (e.g., "MyDog@Loves2Run!InThePark2024")
- Make it at least 16 characters long

❌ **DON'T:**
- Reuse passwords from other sites
- Share your master password
- Use simple passwords (e.g., "password123")
- Store it in plain text on your computer

### Password Management

✅ **DO:**
- Use the password generator for new accounts
- Use unique passwords for every site
- Update passwords regularly (every 3-6 months)
- Enable two-factor authentication (2FA) on important accounts

❌ **DON'T:**
- Reuse passwords across multiple sites
- Use personal information in passwords
- Share passwords via email or text
- Write passwords on sticky notes

### Account Security

✅ **DO:**
- Sign out when using shared computers
- Keep your browser updated
- Use a secure internet connection
- Review your vault items regularly

❌ **DON'T:**
- Leave your vault unlocked on public computers
- Use public Wi-Fi without a VPN
- Share your device with untrusted people
- Click suspicious links in emails

## Features Overview

### 🔒 Zero-Knowledge Encryption
All encryption happens on your device. The server never sees your plaintext data.

### 🔍 Search
Quickly find items by name, username, or URL.

### 📋 Copy to Clipboard
One-click copying of usernames and passwords.

### 🔑 Password Generator
Generate strong, random passwords instantly.

### ⭐ Favorites
Mark frequently used items as favorites for quick access.

### 🌐 Website Links
Click to open websites directly from your vault.

### 📝 Secure Notes
Store sensitive information beyond just passwords.

### 🔄 Auto-Save
Changes are saved automatically to the server.

### 📱 Responsive Design
Works on desktop, tablet, and mobile devices.

## Troubleshooting

### I forgot my master password

Unfortunately, there is **no way to recover** your master password due to zero-knowledge encryption. This is a security feature, not a bug.

**Prevention:**
- Write down your master password
- Store it in a safe place
- Consider using a physical backup

### My items aren't loading

1. Check your internet connection
2. Refresh the page
3. Try signing out and back in
4. Clear your browser cache
5. Try a different browser

### I can't copy passwords

1. Make sure clipboard access is enabled in your browser
2. Try clicking the "Copy" button again
3. Manually select and copy the text
4. Check browser permissions

### The password generator isn't working

1. Refresh the page
2. Try clicking "Generate" again
3. Manually enter a password
4. Check browser console for errors

### Items are duplicated

1. This may happen if you add the same item twice
2. Delete the duplicate items
3. Use search to find duplicates

## Tips & Tricks

### Organizing Your Vault

- Use clear, descriptive names (e.g., "Gmail - Personal" vs "Gmail - Work")
- Add notes for security questions and recovery codes
- Mark frequently used items as favorites
- Keep your vault organized and up-to-date

### Password Strength

**Weak**: `password123` ❌
**Medium**: `MyPassword123` ⚠️
**Strong**: `MyDog@Loves2Run!2024` ✅
**Very Strong**: `Tr0ub4dor&3-Correct-Horse-Battery` ✅✅

### Using the Vault Efficiently

1. **Add items as you create accounts** - Don't wait until later
2. **Update passwords immediately** - When you change a password, update it in your vault
3. **Review regularly** - Check for old or unused accounts monthly
4. **Use favorites** - Mark your most-used items for quick access
5. **Add notes** - Include security questions, recovery codes, and other important info

## Keyboard Shortcuts

- **Ctrl/Cmd + F**: Focus search bar
- **Escape**: Close modals
- **Enter**: Submit forms

## Privacy & Security

### What We Store

- Your email address (unencrypted)
- Encrypted vault items
- Encrypted encryption keys
- Session tokens
- Audit logs (no sensitive data)

### What We DON'T Store

- Your master password
- Your plaintext passwords
- Your decrypted vault items
- Your encryption keys (unencrypted)

### Data Encryption

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2-SHA256 (100,000 iterations)
- **Key Size**: 256-bit
- **IV**: Random, unique per encryption

## Getting Help

### Support

- **Email**: support@example.com
- **Documentation**: See docs/ folder
- **Security Issues**: security@example.com

### Reporting Bugs

1. Check if the issue is already known
2. Try to reproduce the issue
3. Email support with:
   - Description of the problem
   - Steps to reproduce
   - Browser and OS version
   - Screenshots (if applicable)

## Conclusion

Your zero-knowledge password vault is designed to keep your passwords secure while being easy to use. Remember:

- 🔒 Your master password is the key to everything
- 💾 Back up your master password safely
- 🔑 Use unique passwords for every site
- ⚡ Use the password generator
- 🔍 Keep your vault organized

**Stay secure! 🛡️**

