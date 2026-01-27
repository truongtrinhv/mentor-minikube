#!/bin/bash
# RabbitMQ Integration Test Script
# Tests RabbitMQ connectivity and basic functionality

set -e

echo "========================================="
echo "RabbitMQ Integration Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
passed_count=0
failed_count=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    test_count=$((test_count + 1))
    echo -n "[$test_count] Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        passed_count=$((passed_count + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        failed_count=$((failed_count + 1))
    fi
}

# Test 1: Check namespace exists
run_test "Namespace 'mentorplatform' exists" \
    "kubectl get namespace mentorplatform"

# Test 2: Check RabbitMQ pod is running
run_test "RabbitMQ pod is running" \
    "kubectl get pod -n mentorplatform rabbitmq-0 -o jsonpath='{.status.phase}' | grep -q Running"

# Test 3: Check RabbitMQ pod is ready
run_test "RabbitMQ pod is ready (1/1)" \
    "kubectl get pod -n mentorplatform rabbitmq-0 -o jsonpath='{.status.conditions[?(@.type==\"Ready\")].status}' | grep -q True"

# Test 4: Check ClusterIP service exists
run_test "RabbitMQ ClusterIP service exists" \
    "kubectl get svc -n mentorplatform rabbitmq -o jsonpath='{.spec.type}' | grep -q ClusterIP"

# Test 5: Check NodePort service exists
run_test "RabbitMQ NodePort service exists" \
    "kubectl get svc -n mentorplatform rabbitmq-management -o jsonpath='{.spec.type}' | grep -q NodePort"

# Test 6: Check ConfigMap exists
run_test "RabbitMQ ConfigMap exists" \
    "kubectl get configmap -n mentorplatform rabbitmq-config"

# Test 7: Check RabbitMQ health
run_test "RabbitMQ is responding to health checks" \
    "kubectl exec -n mentorplatform rabbitmq-0 -- rabbitmq-diagnostics ping | grep -q 'Ping succeeded'"

# Test 8: Check AMQP port is open
run_test "AMQP port (5672) is accessible" \
    "kubectl exec -n mentorplatform rabbitmq-0 -- nc -z localhost 5672"

# Test 9: Check Management UI port is open
run_test "Management UI port (15672) is accessible" \
    "kubectl exec -n mentorplatform rabbitmq-0 -- nc -z localhost 15672"

# Test 10: Check users are configured
run_test "Default user 'guest' is configured" \
    "kubectl exec -n mentorplatform rabbitmq-0 -- rabbitmqctl list_users | grep -q guest"

# Test 11: Check RabbitMQ version
run_test "RabbitMQ version 3.13+ is running" \
    "kubectl logs -n mentorplatform rabbitmq-0 | grep -q 'RabbitMQ 3.13'"

# Test 12: Check storage is mounted
run_test "RabbitMQ data volume is mounted" \
    "kubectl exec -n mentorplatform rabbitmq-0 -- test -d /var/lib/rabbitmq"

# Test 13: Check config is mounted
run_test "RabbitMQ config volume is mounted" \
    "kubectl exec -n mentorplatform rabbitmq-0 -- test -d /etc/rabbitmq/conf.d"

# Test 14: Check PersistentVolume claim
run_test "PersistentVolumeClaim is bound" \
    "kubectl get pvc -n mentorplatform rabbitmq-data-rabbitmq-0 -o jsonpath='{.status.phase}' | grep -q Bound"

# Test 15: Check resource limits
run_test "Memory limit is set correctly" \
    "kubectl get pod -n mentorplatform rabbitmq-0 -o jsonpath='{.spec.containers[0].resources.limits.memory}' | grep -q 512Mi"

echo ""
echo "========================================="
echo "Test Results"
echo "========================================="
echo -e "Total Tests:  $test_count"
echo -e "Passed:       ${GREEN}$passed_count${NC}"
echo -e "Failed:       ${RED}$failed_count${NC}"
echo ""

if [ $failed_count -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! RabbitMQ is properly deployed.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
fi
