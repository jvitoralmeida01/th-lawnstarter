#!/bin/bash
# Improved verification script that checks supervisord status
# Usage: docker-compose exec statistics bash scripts/verify-scheduler.sh

echo ">> Checking scheduler status..."
echo ">> =========================="
echo ">> "

# Check supervisord status
if supervisorctl -c /etc/supervisor/supervisord.conf status scheduler 2>/dev/null | grep -q RUNNING; then
    echo ">> ✓ schedule:work process is RUNNING"
    supervisorctl -c /etc/supervisor/supervisord.conf status scheduler
else
    echo ">> ✗ schedule:work process is NOT running"
    echo ">> "
    echo ">> All supervisord processes:"
    supervisorctl -c /etc/supervisor/supervisord.conf status 2>/dev/null || echo ">>   Could not check supervisor status"
fi

echo ">> "
echo ">> Recent scheduler activity (last 50 lines):"
echo ">> -------------------------------------------"
if [ -f /app/storage/logs/laravel.log ]; then
    tail -50 /app/storage/logs/laravel.log | grep -i "statistics:update" || echo ">> No recent activity found in logs"
else
    echo ">> Log file not found yet (will be created on first run)"
fi

echo ">> "
echo ">> Database snapshots:"
echo ">> -------------------"
docker-compose exec -T db psql -U sw_user -d statistics -c "SELECT COUNT(*) as total_snapshots, MAX(computed_at) as last_run FROM stats_snapshots;" 2>/dev/null || echo ">>   Could not check database"

echo ">> "
echo ">> Next scheduled run:"
echo ">> The command 'statistics:update' is scheduled to run every 5 minutes"
echo ""
echo ">> To manually trigger:"
echo ">>   docker-compose exec statistics php artisan statistics:update"
echo ""
echo ">> To watch logs in real-time:"
echo ">>   docker-compose logs -f statistics | grep statistics:update"
echo ""
echo ">> To check supervisord status:"
echo ">>   docker-compose exec statistics supervisorctl -c /etc/supervisor/supervisord.conf status"
