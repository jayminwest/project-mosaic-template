#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Project Mosaic - Supabase Remote Setup${NC}"
echo "This script will help you set up your remote Supabase project."
echo

# Step 1: Login to Supabase
echo -e "${YELLOW}Step 1: Login to Supabase${NC}"
echo "First, let's make sure you're logged in to Supabase."
supabase login
echo

# Step 2: Link to the project
echo -e "${YELLOW}Step 2: Link to your Supabase project${NC}"
echo "Select your project from the list:"
supabase link
echo

# Step 3: Reset database password
echo -e "${YELLOW}Step 3: Reset your database password${NC}"
echo "Let's reset your database password through the Supabase dashboard."
echo -e "${GREEN}1.${NC} Open the Supabase dashboard: https://supabase.com/dashboard"
echo -e "${GREEN}2.${NC} Select your project: MosaicTemplate"
echo -e "${GREEN}3.${NC} Go to Project Settings > Database"
echo -e "${GREEN}4.${NC} Find 'Database Password' section and click 'Reset Password'"
echo -e "${GREEN}5.${NC} Copy the new password"
echo
read -p "Have you reset your password? (y/n): " reset_password

if [ "$reset_password" != "y" ]; then
  echo -e "${RED}Please reset your password before continuing.${NC}"
  exit 1
fi

# Step 4: Update .env file with new password
echo -e "${YELLOW}Step 4: Update your .env file${NC}"
echo "Let's update your .env file with the new database password."
read -s -p "Enter your new database password: " db_password
echo

# Check if .env file exists
if [ -f .env.local ]; then
  # Check if SUPABASE_DB_PASSWORD already exists in .env.local
  if grep -q "SUPABASE_DB_PASSWORD" .env.local; then
    # Update existing password
    sed -i '' "s/SUPABASE_DB_PASSWORD=.*/SUPABASE_DB_PASSWORD=$db_password/" .env.local
  else
    # Add new password
    echo "SUPABASE_DB_PASSWORD=$db_password" >> .env.local
  fi
else
  # Create new .env.local file
  echo "SUPABASE_DB_PASSWORD=$db_password" > .env.local
fi

echo -e "${GREEN}Password updated in .env.local${NC}"
echo

# Step 5: Push database changes
echo -e "${YELLOW}Step 5: Push database changes${NC}"
echo "Now let's push your database changes to the remote project."
echo "When prompted, use the password you just set."

# Export the password for the supabase command
export SUPABASE_DB_PASSWORD=$db_password

# Push the database changes
supabase db push

echo
echo -e "${GREEN}Setup complete!${NC}"
echo "Your Supabase project should now be properly configured."
