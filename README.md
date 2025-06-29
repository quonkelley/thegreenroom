# TheGreenRoom.ai - AI Booking Assistant Landing Page

A stunning, modern SaaS landing page for TheGreenRoom.ai - an AI-powered assistant for independent artists and venues. Built with React, Tailwind CSS, and Framer Motion for beautiful animations.

## ✨ Features

- **Dark Music Industry Theme** - Sleek dark design with vibrant accent colors
- **Smooth Animations** - Framer Motion powered animations and micro-interactions
- **Responsive Design** - Perfect on all devices from mobile to desktop
- **Modern UI Components** - Glass morphism effects, gradients, and hover states
- **Professional Sections** - Hero, features, testimonials, and CTA sections
- **Email Capture** - Functional email signup forms
- **Mailchimp Integration** - Email signup integration with Mailchimp

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **Lucide React** - Beautiful icon library
- **Google Fonts** - Inter & Poppins typography
- **Mailchimp** - Email collection and signup integration

## 📱 Sections

1. **Hero Section** - Eye-catching headline with email capture
2. **For Artists** - Feature cards highlighting artist benefits
3. **For Venues** - Feature cards highlighting venue benefits
4. **Social Proof** - Customer testimonials with star ratings
5. **Waitlist CTA** - Final call-to-action with email signup
6. **Footer** - Links, social media, and company info

## 🎨 Design Features

- **Gradient Text Effects** - Beautiful gradient text animations
- **Glass Morphism** - Modern glass-like card effects
- **Floating Animations** - Subtle background element animations
- **Hover Interactions** - Smooth hover states and transitions
- **Scroll Animations** - Elements animate as they come into view

## 📦 Build for Production

```bash
npm run build
```

## 🎯 Customization

The landing page is fully customizable:

- **Colors**: Edit the color palette in `tailwind.config.js`
- **Content**: Update text content in `src/App.js`
- **Animations**: Modify animation settings in the motion components
- **Styling**: Customize styles in `src/index.css`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Mailchimp Setup

**Important**: Before the email signup forms work, you need to configure your Mailchimp credentials.

### Step 1: Get Your Mailchimp Credentials

1. **Mailchimp User ID**:
   - Log into Mailchimp
   - Go to **Account** → **Account & billing** → **Account**
   - Copy your **Account ID**

2. **Mailchimp List ID**:
   - Go to **Audience** → **All contacts**
   - Click **Settings** → **Audience name and defaults**
   - Copy your **Audience ID**

3. **Mailchimp Server Prefix**:
   - Look at your Mailchimp URL (e.g., `https://us1.admin.mailchimp.com/`)
   - Copy the prefix (e.g., `us1`, `us2`)

### Step 2: Update Configuration Files

1. **Update `public/index.html`**:
   Replace the placeholder in the Mailchimp script:
   ```html
   <script id="mcjs">!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/YOUR_MAILCHIMP_USER_ID/YOUR_MAILCHIMP_LIST_ID.js");</script>
   ```

2. **Update `src/emailService.js`**:
   Replace the placeholders in the `submitToMailchimp` function:
   ```javascript
   form.action = 'https://YOUR_MAILCHIMP_SERVER.list-manage.com/subscribe/post?u=YOUR_MAILCHIMP_USER_ID&id=YOUR_MAILCHIMP_LIST_ID';
   ```

### Step 3: Test Email Signup

1. Build and deploy the site:
```bash
npm run deploy
```

2. Test the email signup forms on your live site

## 🚀 Deployed on GitHub Pages

The site is configured for GitHub Pages deployment:

1. Build the project:
```bash
npm run build
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

The site will be available at: `https://quonkelley.github.io/thegreenroom/`

## 📄 Project Structure

```
TheGreenRoom/
├── public/
│   ├── index.html          # Main HTML file with Mailchimp script
│   └── ...
├── src/
│   ├── App.js              # Main React component
│   ├── emailService.js     # Mailchimp integration
│   ├── index.css           # Tailwind CSS styles
│   └── index.js            # React entry point
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🎯 Customization

### Colors and Styling
- Edit `tailwind.config.js` to customize the color scheme
- Modify `src/index.css` for additional custom styles

### Content
- Update text content in `src/App.js`
- Replace images and icons as needed

### Email Integration
- Modify `src/emailService.js` for different email service providers
- Update Mailchimp form fields and validation

## 🤔 Troubleshooting

### Email Forms Not Working
- Ensure Mailchimp credentials are correctly configured
- Check browser console for JavaScript errors
- Verify Mailchimp list is active and accepting subscribers

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for syntax errors in React components
- Ensure all dependencies are installed

### Deployment Issues
- Verify `homepage` field in `package.json` matches your GitHub Pages URL
- Check that the `gh-pages` branch exists in your repository
- Clear browser cache after deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🤖 Support

For questions or issues:
- Check the troubleshooting section above
- Review Mailchimp's documentation for email integration
- Open an issue on GitHub

---

Built with ❤️ for the music industry 