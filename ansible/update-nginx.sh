#!/bin/bash
# Script to update nginx configuration for portfolio deployment

echo "🔧 Updating nginx configuration for containerized portfolio..."

# Copy the generated nginx configuration
sudo cp /home/joon628/websites/portfolio.organictechs.com/nginx.conf /etc/nginx/sites-available/portfolio.organictechs.com

# Test nginx configuration
if sudo nginx -t; then
    echo "✅ Nginx configuration test passed"
    
    # Reload nginx
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
    
    # Test the site
    echo "🔍 Testing site accessibility..."
    if curl -s -o /dev/null -w "%{http_code}" https://portfolio.organictechs.com | grep -q "200"; then
        echo "✅ Site is accessible at https://portfolio.organictechs.com"
        echo "✅ Admin panel is available at https://portfolio.organictechs.com/admin"
        echo "   Login: admin / portfolio2024"
    else
        echo "⚠️  Site test failed. Check nginx logs: sudo journalctl -u nginx -f"
    fi
else
    echo "❌ Nginx configuration test failed"
    echo "Please check the configuration at /etc/nginx/sites-available/portfolio.organictechs.com"
fi

echo ""
echo "📊 Container status:"
cd /home/joon628/websites/portfolio.organictechs.com && docker compose ps