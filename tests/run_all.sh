#!/bin/bash

# ==============================================================================
# Obsidian Brand Gate — Verification Test Suite Runner
# ==============================================================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'
YELLOW='\033[1;33m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}  Running Obsidian Brand Gate Verification Tests${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Compile first
echo -e "${BLUE}Compiling TypeScript...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Compilation failed!${NC}"
    exit 1
fi
echo -e "${GREEN}Compilation successful.${NC}\n"

# Create log/evidence directory
mkdir -p evidence

FAILED=0

# Helper to run a test and assert its exit code
# Usage: run_test <file> <profile> <expected_exit_code>
run_test() {
    local file=$1
    local profile=$2
    local expected=$3
    
    echo -e "${BLUE}Evaluating ${file} against ${profile}...${NC}"
    node dist/index.js evaluate -f "$file" -c "$profile" > /dev/null 2>&1
    local status=$?
    
    if [ $status -eq $expected ]; then
        echo -e "${GREEN}✓ [PASS] ${file} exited with ${status} as expected.${NC}"
    else
        echo -e "${RED}✗ [FAIL] ${file} exited with ${status}, but expected ${expected}.${NC}"
        FAILED=1
    fi
}

# 1. Test standard compliance (should pass: exit 0)
run_test "tests/fixtures/test_compliant.md" "profiles/coa_ir_directive.json" 0

# 2. Test standard rogue language (should be blocked: exit 1)
run_test "tests/fixtures/test_rogue.md" "profiles/coa_ir_directive.json" 1

# 3. Test legal hallucination against standard profile (should be blocked: exit 1)
run_test "tests/fixtures/test_legal_hallucination.md" "profiles/coa_ir_legal_sector.json" 1

# 4. Test HIPAA violation against healthcare profile (should be blocked: exit 1)
run_test "tests/fixtures/test_hipaa_violation.md" "profiles/coa_ir_healthcare_sector.json" 1

# 5. Test airline hallucination against standard profile (should be blocked: exit 1)
run_test "tests/fixtures/test_airline_hallucination.md" "profiles/coa_ir_directive.json" 1

# 6. Test evaluation with a Knowledge Base (should be blocked: exit 1)
echo -e "${BLUE}Evaluating test_legal_hallucination.md against profiles/coa_ir_legal_sector.json with Knowledge Base...${NC}"
node dist/index.js evaluate -f "tests/fixtures/test_legal_hallucination.md" -c "profiles/coa_ir_legal_sector.json" -k "tests/fixtures/knowledge_base.json" > /dev/null 2>&1
status=$?
if [ $status -eq 1 ]; then
    echo -e "${GREEN}✓ [PASS] Knowledge Base validation correctly blocked hallucinated references (exit 1).${NC}"
else
    echo -e "${RED}✗ [FAIL] Knowledge Base validation failed to block (exit ${status}).${NC}"
    FAILED=1
fi

# 7. Run the LLM reproduction test suite
echo -e "\n${BLUE}Running LLM Hallucination Reproduction Test Suite...${NC}"
node dist/reproduction_tests.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ [PASS] LLM reproduction tests completed successfully.${NC}"
else
    echo -e "${RED}✗ [FAIL] LLM reproduction tests failed.${NC}"
    FAILED=1
fi

echo -e "\n${BLUE}======================================================================${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}ALL VERIFICATION TESTS PASSED SUCCESSFULLY!${NC}"
    echo -e "${BLUE}======================================================================${NC}"
    exit 0
else
    echo -e "${RED}SOME VERIFICATION TESTS FAILED!${NC}"
    echo -e "${BLUE}======================================================================${NC}"
    exit 1
fi
