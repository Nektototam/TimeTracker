#!/bin/bash
echo "=== TimeTracker Local Test Suite ==="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Проверка API Health
echo "1. Checking API Health..."
response=$(curl -s http://localhost:4000/health)
if [ "$response" = '{"ok":true}' ]; then
  echo -e "${GREEN}✅ API Health: OK${NC}"
else
  echo -e "${RED}❌ API Health: FAILED${NC}"
  echo "   Response: $response"
fi

# 2. Проверка регистрации пользователя
echo ""
echo "2. Testing User Registration..."
reg_response=$(curl -s -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}')
if echo "$reg_response" | grep -q "accessToken\|already exists"; then
  echo -e "${GREEN}✅ Registration: OK${NC}"
else
  echo -e "${YELLOW}⚠️  Registration: ${NC}$reg_response"
fi

# 3. Проверка логина
echo ""
echo "3. Testing User Login..."
login_response=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}')
  
if echo "$login_response" | grep -q "accessToken"; then
  echo -e "${GREEN}✅ Login: OK${NC}"
  TOKEN=$(echo $login_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:20}..."
else
  echo -e "${RED}❌ Login: FAILED${NC}"
  echo "   Response: $login_response"
  TOKEN=""
fi

# 4. Проверка защищенных роутов (если есть токен)
if [ -n "$TOKEN" ]; then
  echo ""
  echo "4. Testing Protected Routes..."
  
  # Settings
  settings_response=$(curl -s http://localhost:4000/settings \
    -H "Authorization: Bearer $TOKEN")
  if echo "$settings_response" | grep -q "pomodoroWorkTime\|Unauthorized"; then
    echo -e "${GREEN}✅ Settings endpoint: OK${NC}"
  else
    echo -e "${YELLOW}⚠️  Settings: ${NC}$settings_response"
  fi
  
  # Time Entries Today
  entries_response=$(curl -s http://localhost:4000/time-entries/today \
    -H "Authorization: Bearer $TOKEN")
  if echo "$entries_response" | grep -q "items"; then
    echo -e "${GREEN}✅ Time Entries endpoint: OK${NC}"
  else
    echo -e "${YELLOW}⚠️  Time Entries: ${NC}$entries_response"
  fi
  
  # Project Types
  projects_response=$(curl -s http://localhost:4000/project-types \
    -H "Authorization: Bearer $TOKEN")
  if echo "$projects_response" | grep -q "items"; then
    echo -e "${GREEN}✅ Project Types endpoint: OK${NC}"
  else
    echo -e "${YELLOW}⚠️  Project Types: ${NC}$projects_response"
  fi
fi

# 5. Проверка Frontend доступности
echo ""
echo "5. Checking Frontend..."
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$frontend_response" = "200" ]; then
  echo -e "${GREEN}✅ Frontend: Running on http://localhost:3000${NC}"
else
  echo -e "${RED}❌ Frontend: Not accessible (HTTP $frontend_response)${NC}"
fi

echo ""
echo "=== Test Summary ==="
echo "API:      http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in browser"
echo "2. Try to register/login"
echo "3. Start timer and test functionality"
