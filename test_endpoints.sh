#!/bin/bash

# Base URL for the API
BASE_URL="http://localhost:3000"

# --- Helper Functions ---

# Function to print a test header
print_header() {
    echo "" # Add a space between tests
    echo "============================================================"
    echo "TEST: $1"
    echo "============================================================"
}

# Function to print the final results
print_final_results() {
    echo ""
    echo "============================================================"
    echo "FINAL RESULTS"
    echo "============================================================"
    echo "Total Score: $1/$2"
    if [ "$1" -lt "$2" ]; then
        echo "Status: FAILED ✗"
    else
        echo "Status: PASSED ✓"
    fi
    echo "============================================================"
}

# Function to check if jq is installed
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        echo "WARNING: 'jq' is not installed."
        echo "Test 2 (filtering/sorting) will be skipped."
        echo "Please install jq to run all tests."
        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        return 1
    fi
    return 0
}

# --- Initialization ---

# Initialize total score
total_score=0
max_score=90 # Adjusted to match test points (25+25+10+10+10+10 = 90)
jq_installed=0
check_jq && jq_installed=1

# --- Test Definitions ---

# Test 1: POST /countries/refresh (25 points)
print_header "POST /countries/refresh (25 points)"
test1_score=0
refresh_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/countries/refresh")
if [ "$refresh_response" -eq 200 ]; then
    echo "✓ Refresh endpoint works (25 pts)"
    test1_score=25
else
    echo "✗ Refresh endpoint failed with status $refresh_response (0 pts)"
fi
total_score=$((total_score + test1_score))
echo "Score: $test1_score/25"

# Test 2: GET /countries (filters & sorting) (25 points)
print_header "GET /countries (filters & sorting) (25 points)"
test2_score=0
# Basic GET
countries_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/countries")
if [ "$countries_response" -eq 200 ]; then
    echo "✓ Basic GET /countries works (5 pts)"
    test2_score=$((test2_score + 5))
else
    echo "✗ Basic GET /countries failed with status $countries_response (0 pts)"
fi

# Advanced filter/sort tests (requires jq)
if [ "$jq_installed" -eq 1 ]; then
    # Test sorting
    # We expect 'Zimbabwe' to be first when sorting by name descending
    sorted_response=$(curl -s "$BASE_URL/countries?sort_by=name&order=desc")
    first_country_sorted=$(echo "$sorted_response" | jq -r '.[0].name.common')
    if [ "$first_country_sorted" == "Zimbabwe" ]; then
        echo "✓ Sorting (order=desc) works (10 pts)"
        test2_score=$((test2_score + 10))
    else
        echo "✗ Sorting (order=desc) failed. Expected 'Zimbabwe', got '$first_country_sorted' (0 pts)"
    fi

    # Test filtering
    # We expect the first country to be in 'Africa'
    filtered_response=$(curl -s "$BASE_URL/countries?region=Africa")
    first_country_region=$(echo "$filtered_response" | jq -r '.[0].region')
    if [ "$first_country_region" == "Africa" ]; then
        echo "✓ Filtering (region=Africa) works (10 pts)"
        test2_score=$((test2_score + 10))
    else
        echo "✗ Filtering (region=Africa) failed. Expected region 'Africa', got '$first_country_region' (0 pts)"
    fi
else
    echo "--- Skipping filter/sort tests: jq not found (20 pts)"
fi

total_score=$((total_score + test2_score))
echo "Score: $test2_score/25"


# Test 3: GET /countries/:name (10 points)
print_header "GET /countries/:name (10 points)"
test3_score=0
# Get a specific country
country_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/countries/Nigeria")
if [ "$country_response" -eq 200 ]; then
    echo "✓ Get specific country works (5 pts)"
    test3_score=$((test3_score + 5))
else
    echo "✗ Get specific country failed with status $country_response (0 pts)"
fi
# Test for non-existent country
non_existent_country_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/countries/NonExistentCountry")
if [ "$non_existent_country_response" -eq 404 ]; then
    echo "✓ Returns 404 for non-existent country (5 pts)"
    test3_score=$((test3_score + 5))
else
    echo "✗ Should return 404 for non-existent country, got $non_existent_country_response (0 pts)"
fi
total_score=$((total_score + test3_score))
echo "Score: $test3_score/10"

# Test 4: DELETE /countries/:name (10 points)
# Note: This test is DESTRUCTIVE and assumes Test 1 can be re-run to reset state.
print_header "DELETE /countries/:name (10 points)"
test4_score=0
# Delete a country (using a non-essential one for testing, e.g., 'Aruba')
# Running 'refresh' first to ensure 'Aruba' exists
curl -s -X POST "$BASE_URL/countries/refresh" > /dev/null
delete_response=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/countries/Aruba")
if [ "$delete_response" -eq 200 ]; then
    echo "✓ Delete endpoint works (5 pts)"
    test4_score=$((test4_score + 5))
else
    echo "✗ Delete endpoint failed with status $delete_response (0 pts)"
fi
# Verify deletion
verify_delete_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/countries/Aruba")
if [ "$verify_delete_response" -eq 404 ]; then
    echo "✓ Country doesn't exist after deletion (5 pts)"
    test4_score=$((test4_score + 5))
else
    echo "✗ Country still exists after deletion (0 pts)"
fi
total_score=$((total_score + test4_score))
echo "Score: $test4_score/10"

# Test 5: GET /status (10 points)
print_header "GET /status (10 points)"
test5_score=0
# FIX: Added \n to -w flag to put the status code on a new line
status_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/status")
status_code=$(tail -n1 <<< "$status_response")
status_body=$(head -n -1 <<< "$status_response")

if [ "$status_code" -eq 200 ]; then
    echo "✓ Status endpoint accessible (3 pts)"
    test5_score=$((test5_score + 3))
    if echo "$status_body" | grep -q "total_countries"; then
        echo "✓ Returns total_countries field (3 pts)"
        test5_score=$((test5_score + 3))
    else
        echo "✗ Does not return total_countries field (0 pts)"
    fi
    if echo "$status_body" | grep -q "last_refreshed_at"; then
        echo "✓ Returns last_refreshed_at field (2 pts)"
        test5_score=$((test5_score + 2))
    else
        echo "✗ Does not return last_refreshed_at field (0 pts)"
    fi
    # TODO: Add validation for timestamp format
else
    echo "✗ Status endpoint failed with status $status_code (0 pts)"
fi
total_score=$((total_score + test5_score))
echo "Score: $test5_score/10"

# Test 6: GET /countries/image (10 points)
print_header "GET /countries/image (10 points)"
test6_score=0 # FIX: Added local score variable
image_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/countries/image")
if [ "$image_response" -eq 200 ]; then
    echo "✓ Image endpoint works (10 pts)"
    test6_score=10 # FIX: Update local score
else
    echo "✗ Image endpoint failed with status $image_response (0 pts)"
fi
total_score=$((total_score + test6_score)) # FIX: Add local score to total
echo "Score: $test6_score/10" # FIX: Report local score


# --- Final Tally ---
print_final_results $total_score $max_score

# Rerun refresh at the end to restore any deleted countries for future runs
curl -s -X POST "$BASE_URL/countries/refresh" > /dev/null
echo "Note: Country data has been refreshed."
