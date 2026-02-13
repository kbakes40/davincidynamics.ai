# Google Analytics 4 (GA4) Setup Instructions

Your site is now configured for GA4 tracking! Follow these steps to activate analytics.

## Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Click **Create Property**
4. Enter property details:
   - **Property name**: DaVinci Dynamics
   - **Reporting time zone**: Your timezone
   - **Currency**: USD
5. Click **Next** → **Create**

## Step 2: Get Your Measurement ID

1. After creating the property, you'll see **Data Streams**
2. Click **Add stream** → **Web**
3. Enter:
   - **Website URL**: https://www.davincidynamics.ai
   - **Stream name**: DaVinci Dynamics Website
4. Click **Create stream**
5. **Copy the Measurement ID** (looks like `G-XXXXXXXXXX`)

## Step 3: Add Measurement ID to Your Site

1. Open `client/index.html` in your project
2. Find **both** instances of `GA_MEASUREMENT_ID` (lines 32 and 37)
3. Replace `GA_MEASUREMENT_ID` with your actual Measurement ID

**Before:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID', {
    send_page_view: true
  });
</script>
```

**After:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123XYZ', {
    send_page_view: true
  });
</script>
```

## Step 4: Verify Tracking

1. Save and deploy your changes
2. Visit your website
3. Go back to GA4 → **Reports** → **Realtime**
4. You should see yourself as an active user!

## What's Being Tracked

### Automatic Events
- **Page views**: Every page visit
- **Scroll depth**: How far users scroll
- **Outbound clicks**: Links to external sites

### Custom Events (Already Configured)
- **button_click**: All CTA button clicks
  - Book Demo (header, platform demo)
  - Hire via Fiverr (header)
  - Start Chat Now (platform demo)
- **video_play**: When users play demo videos
- **video_pause**: When users pause demo videos
- **chat_open**: When Sophia chat widget opens
- **chat_close**: When Sophia chat widget closes
- **conversion**: Key conversion events
  - demo_booking
  - fiverr_click
  - chat_started

### Event Parameters
Each event includes contextual data:
- **button_name**: Which button was clicked
- **location**: Where on the site (header, platform_demo, etc.)
- **video_name**: Which video (Mobile/Desktop Demo Video)
- **chat_bot**: Always "Sophia"

## Viewing Your Data

### Realtime Reports
**Admin → Reports → Realtime**
- See live visitors
- Watch events as they happen
- Test your tracking immediately

### Event Reports
**Admin → Reports → Engagement → Events**
- See all tracked events
- View event counts and parameters
- Identify most popular actions

### Conversion Tracking
**Admin → Configure → Events**
- Mark events as conversions (demo_booking, fiverr_click, chat_started)
- Track conversion rates
- Measure ROI

### Custom Reports
**Admin → Explore**
- Build custom dashboards
- Analyze user journeys
- Create funnels (Visit → Chat → Demo Booking)

## Troubleshooting

### Not seeing data?
1. Check that you replaced **both** instances of `GA_MEASUREMENT_ID`
2. Clear browser cache and reload
3. Check browser console for errors (F12 → Console)
4. Verify GA4 property is active (not deleted)

### Events not firing?
1. Open browser console (F12)
2. Look for `[GA4 Event]` logs when clicking buttons
3. If you see the logs but no GA4 data, check Measurement ID

### Still stuck?
- Check GA4 DebugView: **Admin → Configure → DebugView**
- Enable debug mode: Add `?debug_mode=true` to your URL

## Next Steps

1. **Set up conversions**: Mark key events as conversions in GA4
2. **Create audiences**: Segment users by behavior (e.g., "Opened chat but didn't book")
3. **Link Google Ads**: Track ad performance and ROI
4. **Set up goals**: Define success metrics (e.g., 10% conversion rate)
5. **Enable enhanced measurement**: Scroll tracking, file downloads, site search

## Support

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
