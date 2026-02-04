# Secure Password Sharing Guide

## Overview

Your password manager now includes **secure team sharing** functionality. Share passwords with team members while maintaining end-to-end encryption and access control.

## How It Works

### Security Model

1. **End-to-End Encryption**: Passwords are encrypted on your device before sharing
2. **Login Required**: Recipients must have an account and be logged in to view shared items
3. **Access Control**: You control who can view or edit each shared item
4. **Revocable**: You can revoke access at any time

### Sharing Process

```
You (Owner) → Encrypt with your key → Share → Recipient logs in → Decrypt with their key
```

The server never sees the plaintext password!

## How to Share a Password

### Step 1: Open the Item

1. Go to your Vault
2. Click on the password item you want to share
3. Click the **"Share"** button (green button with share icon)

### Step 2: Enter Recipient Details

1. **Email Address**: Enter the recipient's email (they must have an account)
2. **Permission Level**:
   - **View Only**: Recipient can see the password but cannot edit it
   - **Can Edit**: Recipient can view and modify the password

### Step 3: Share

1. Click **"Share Item"**
2. The recipient will now see this item in their vault
3. They'll see a badge showing it's "Shared by [your email]"

## Permission Levels

### View Only
- ✅ Can see username and password
- ✅ Can copy credentials
- ✅ Can view notes and URLs
- ❌ Cannot edit any fields
- ❌ Cannot delete the item

### Can Edit
- ✅ All "View Only" permissions
- ✅ Can modify username, password, notes
- ✅ Can update the item
- ❌ Cannot delete the item (only owner can)

## Managing Shared Items

### View Who Has Access

1. Open the item
2. Click **"Share"**
3. See the "Currently Shared With" section
4. Shows all recipients, their permission level, and share date

### Revoke Access

1. Open the item
2. Click **"Share"**
3. Find the recipient in "Currently Shared With"
4. Click **"Revoke"**
5. Confirm the action

The recipient will immediately lose access to the item.

### Update Permissions

Currently, to change permissions:
1. Revoke the existing share
2. Share again with the new permission level

## Recipient Experience

### Viewing Shared Items

When someone shares a password with you:

1. **Login to your vault**
2. The shared item appears in your vault list
3. Look for the green badge: **"Shared by [owner email]"**
4. Click to view the item

### Limitations for Recipients

- **Cannot delete** shared items (only owner can)
- **Cannot share** items that were shared with you
- **View-only items** cannot be edited
- If owner revokes access, item disappears from your vault

## Use Cases

### Team Credentials
Share company accounts with your team:
- Social media accounts
- Shared email accounts
- Admin panels
- API keys

### Client Access
Share credentials with clients:
- Website admin access
- Hosting accounts
- Domain registrar logins

### Family Sharing
Share with family members:
- Streaming services
- Utility accounts
- Shared subscriptions

### Temporary Access
Share with contractors:
- Give "View Only" access
- Revoke when project ends
- No need to change passwords

## Security Best Practices

### ✅ Do's

- **Verify recipient email** before sharing
- **Use "View Only"** when edit access isn't needed
- **Review shares regularly** and revoke unused access
- **Share only what's necessary** (principle of least privilege)
- **Revoke access** when team members leave

### ❌ Don'ts

- **Don't share with untrusted users**
- **Don't use personal email** for work credentials
- **Don't forget to revoke** when access is no longer needed
- **Don't share sensitive items** unnecessarily

## Technical Details

### Encryption

- **Algorithm**: AES-256-GCM (industry standard)
- **Key Derivation**: PBKDF2 with unique salt per user
- **Zero-Knowledge**: Server cannot decrypt shared items

### Access Control

- **Owner**: Full control (view, edit, delete, share, revoke)
- **Editor**: Can view and edit (cannot delete or share)
- **Viewer**: Can only view (cannot edit, delete, or share)

### Audit Trail

Each share action is tracked:
- Who shared what
- With whom
- When
- Permission level
- Revocation events

## Troubleshooting

### "Recipient not found"

**Problem**: The email address doesn't have an account

**Solution**: 
1. Ask the recipient to create an account first
2. Use the exact email they registered with
3. Try sharing again

### "Item already shared with this user"

**Problem**: You've already shared this item with them

**Solution**:
1. Check "Currently Shared With" section
2. Revoke the existing share if you want to change permissions
3. Share again with new permissions

### Recipient can't see shared item

**Problem**: Recipient doesn't see the item in their vault

**Solution**:
1. Confirm they're logged in with the correct email
2. Ask them to refresh the page
3. Verify the share wasn't revoked
4. Check if they're using the same email you shared to

### Cannot edit shared item

**Problem**: Edit button is disabled

**Solution**:
- Check if you have "View Only" permission
- Only "Can Edit" permission allows modifications
- Contact the owner to upgrade your permission

## Demo Mode Notes

In demo mode (current setup):
- All data stored in browser localStorage
- Sharing works between accounts on the same browser
- Recipient must create account in same browser
- Data doesn't sync across devices
- Perfect for testing and demonstrations

## Production Deployment

When deploying with backend:
- Shares sync across all devices
- Real-time access revocation
- Audit logs for compliance
- Email notifications for shares
- Cross-browser and cross-device support

## FAQ

**Q: Can I share with multiple people?**
A: Yes! Share the same item with as many people as needed.

**Q: Will recipients see my other passwords?**
A: No, they only see items you explicitly share with them.

**Q: Can I change permissions after sharing?**
A: Yes, revoke and re-share with new permissions.

**Q: What happens if I delete a shared item?**
A: It disappears from all recipients' vaults immediately.

**Q: Can recipients share items I shared with them?**
A: No, only the original owner can share items.

**Q: Is sharing secure?**
A: Yes! End-to-end encryption ensures only you and the recipient can decrypt the password.

**Q: Can I see who accessed a shared item?**
A: In production mode with backend, yes. Demo mode doesn't track access.

**Q: What if I forget to revoke access?**
A: Review your shares regularly. You can always revoke access later.

---

## Quick Reference

### Share an Item
1. Open item → Click "Share"
2. Enter email + permission
3. Click "Share Item"

### Revoke Access
1. Open item → Click "Share"
2. Find recipient → Click "Revoke"

### View Shared Items
- Look for green "Shared by" badge in vault list

---

**Need Help?** Check the [User Guide](USER_GUIDE.md) or [Security Documentation](SECURITY.md)
