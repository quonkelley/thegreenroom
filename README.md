# TheGreenRoom.ai - AI Booking Assistant Landing Page

A stunning, modern SaaS landing page for TheGreenRoom.ai - an AI-powered assistant for independent artists and venues. Built with React, Tailwind CSS, and Framer Motion for beautiful animations.

## ✨ Features

- **Dark Music Industry Theme** - Sleek dark design with vibrant accent colors
- **Smooth Animations** - Framer Motion powered animations and micro-interactions
- **Responsive Design** - Perfect on all devices from mobile to desktop
- **Modern UI Components** - Glass morphism effects, gradients, and hover states
- **Professional Sections** - Hero, features, testimonials, and CTA sections
- **Email Capture** - Functional email signup forms
- **Resend Integration** - Email signup integration with Resend

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **Lucide React** - Beautiful icon library
- **Google Fonts** - Inter & Poppins typography
- **Resend** - Email collection and signup integration

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

## 📧 Resend Setup

**Important**: Before the email signup forms work, you need to configure your Resend credentials.

### Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to API Keys in your dashboard
3. Create a new API key
4. Copy the API key

### Step 2: Update Configuration Files

1. **Update `.env`**:
   Replace the placeholder in the `.env` file:
   ```env
   REACT_APP_RESEND_API_KEY=your_resend_api_key_here
   PORT=3001
   # React app port
   # PORT=3000
   ```

### Step 3: Test Email Signup

1. Start the dev servers:
```bash
npm run dev
```

2. Test the email signup forms on your local site

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
│   ├── index.html          # Main HTML file
│   └── ...
├── src/
│   ├── App.js              # Main React component
│   ├── emailService.js     # Resend integration
│   ├── index.css           # Tailwind CSS styles
│   └── index.js            # React entry point
├── server.js               # Express backend for Resend and analytics
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
- Update form fields and validation as needed

## 🤔 Troubleshooting

### Email Forms Not Working
- Ensure Resend credentials are correctly configured
- Check browser console for JavaScript errors
- Verify your Resend account is active and accepting requests

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
- Open an issue on GitHub

---

Built with ❤️ for the music industry 