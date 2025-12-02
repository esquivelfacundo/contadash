#!/bin/bash

echo "🚀 ContaDash - Setup Script"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if pg_isready > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not running${NC}"
    echo "Please start PostgreSQL and try again"
    exit 1
fi

# Create database
echo ""
echo "🗄️  Creating database..."
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw contadash; then
    echo -e "${YELLOW}⚠️  Database 'contadash' already exists${NC}"
else
    createdb contadash
    echo -e "${GREEN}✅ Database 'contadash' created${NC}"
fi

# Backend setup
echo ""
echo "🔧 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please update DATABASE_URL in backend/.env if needed${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists${NC}"
fi

echo "📦 Installing backend dependencies..."
npm install

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Running migrations..."
npx prisma migrate dev --name init

echo "🌱 Seeding database..."
npx prisma db seed

cd ..

echo ""
echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. cd backend && npm run dev"
echo "  2. Visit http://localhost:4000"
echo "  3. Login with demo@contadash.com / demo123456"
echo ""
echo "🎉 Happy coding!"
