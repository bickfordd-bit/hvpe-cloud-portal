#!/bin/bash

# HVPE Cloud Portal - Branch Creation Script
# This script creates all the standardized branches defined in BRANCH_ARCHITECTURE.md

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Ensure we're on main and up to date
print_status "Ensuring main branch is up to date..."
git checkout main
git fetch origin
git pull origin main

print_success "Main branch updated"

# Define branches to create with their descriptions
declare -A BRANCHES
BRANCHES[bickford-mobile]="Mobile application version of Bickford AI"
BRANCHES[bickford]="Core Bickford AI features and enhancements"
BRANCHES[hvpetrader]="Full-featured trading platform"
BRANCHES[bickford-for-defense]="Defense and government sector specialization"
BRANCHES[penelope]="AI-powered content generation platform"
BRANCHES[dad]="Personal workspace for family financial planning"
BRANCHES[derek-and-jenna]="Shared workspace for collaborative projects"
BRANCHES[xavier]="Personal development workspace"
BRANCHES[naomi]="Personal development workspace"

echo ""
print_status "The following branches will be created:"
echo ""
for branch in "${!BRANCHES[@]}"; do
    echo "  • ${branch}: ${BRANCHES[$branch]}"
done
echo ""

# Ask for confirmation
read -p "Do you want to proceed? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Branch creation cancelled"
    exit 0
fi

echo ""
print_status "Creating branches..."
echo ""

# Counter for created branches
CREATED=0
SKIPPED=0

# Create each branch
for branch in "${!BRANCHES[@]}"; do
    # Check if branch already exists locally
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        print_warning "Branch '$branch' already exists locally - skipping"
        ((SKIPPED++))
        continue
    fi
    
    # Check if branch exists on remote
    if git ls-remote --exit-code --heads origin "$branch" > /dev/null 2>&1; then
        print_warning "Branch '$branch' already exists on remote - skipping"
        ((SKIPPED++))
        continue
    fi
    
    # Create the branch
    print_status "Creating branch: $branch"
    git checkout -b "$branch"
    
    # Create a branch-specific README if it doesn't exist
    if [ ! -f "BRANCH_${branch^^}_README.md" ]; then
        cat > "BRANCH_${branch^^}_README.md" << EOF
# ${branch} Branch

## Purpose
${BRANCHES[$branch]}

## Getting Started

This branch is part of the HVPE Cloud Portal multi-branch architecture.

### Setup

1. Ensure you have the base dependencies installed:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. Configure branch-specific environment variables (see below)

4. Run development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Branch-Specific Configuration

Add any additional environment variables needed for this branch:

\`\`\`bash
# Add your ${branch}-specific variables here
# Example:
# ${branch^^}_API_KEY=your_key_here
\`\`\`

### Features

<!-- Document key features specific to this branch -->

- Feature 1
- Feature 2
- Feature 3

### Development

<!-- Branch-specific development notes -->

### Testing

Run tests specific to this branch:

\`\`\`bash
npm test -- --testPathPattern=${branch}
\`\`\`

### Deployment

<!-- Branch-specific deployment instructions -->

### Contributing

See [BRANCH_ARCHITECTURE.md](./BRANCH_ARCHITECTURE.md) for branch workflow guidelines.

---

**Branch Owner**: [Add owner name]  
**Last Updated**: $(date +%Y-%m-%d)
EOF
    fi
    
    # Commit the README
    git add "BRANCH_${branch^^}_README.md"
    git commit -m "Initial commit for ${branch} branch

${BRANCHES[$branch]}

This branch is part of the HVPE Cloud Portal multi-branch architecture.
See BRANCH_ARCHITECTURE.md for more information."
    
    # Push to remote
    git push -u origin "$branch"
    
    print_success "Created and pushed branch: $branch"
    ((CREATED++))
    
    # Return to main
    git checkout main
done

echo ""
print_success "Branch creation complete!"
echo ""
print_status "Summary:"
echo "  • Branches created: $CREATED"
echo "  • Branches skipped: $SKIPPED"
echo ""

# List all branches
print_status "All branches:"
git branch -a | grep -E "(bickford|hvpetrader|penelope|dad|derek|xavier|naomi)" || echo "  (No matching branches found)"

echo ""
print_status "Next steps:"
echo "  1. Review BRANCH_ARCHITECTURE.md for branch guidelines"
echo "  2. Set up branch protection rules in GitHub"
echo "  3. Configure CI/CD for each branch"
echo "  4. Update team documentation with branch ownership"
echo ""

print_success "Done!"
