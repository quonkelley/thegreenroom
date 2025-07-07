# Smart Onboarding System

TheGreenRoom.ai uses a modern, contextual onboarding system that tracks user progress and provides guidance when users are ready for it, not when they're actively working.

## 🎯 **Key Features**

### **Active Step Tracking**
- **Non-intrusive**: Modal won't show when user is actively working on a step
- **Smart completion detection**: Only shows guidance when user completes a step
- **Progress-based triggers**: Modal appears after step completion to guide to next step

### **Contextual Frequency Management**
- **App start**: 2 hours between shows
- **Page visit**: 30 minutes between shows
- **Feature use**: 15 minutes between shows
- **Step completion**: 5 minutes minimum between shows

### **Flexible Integration**
- Easy to integrate into any component
- Automatic state management
- Cross-device persistence

## 🚀 **Usage**

### **1. Basic Integration**

The onboarding modal is automatically rendered in `_app.tsx` and will show for new users:

```tsx
// Already implemented in _app.tsx
<OnboardingModal />
```

### **2. Step Tracking in Components**

Use the `useOnboardingStepTracker` hook to track step completion:

```tsx
import { useOnboardingStepTracker } from '../../components/OnboardingModal';

export default function MyComponent() {
  const { markStepActive, markStepCompleted } = useOnboardingStepTracker();

  const handleStartWork = () => {
    // Mark step as active when user starts working
    markStepActive('profile');
  };

  const handleComplete = () => {
    // Mark step as completed when user finishes
    markStepCompleted('profile');
  };

  return (
    <form onSubmit={handleComplete} onChange={handleStartWork}>
      {/* form fields */}
    </form>
  );
}
```

### **3. Contextual Triggers**

Use the `useOnboardingTrigger` hook for contextual onboarding:

```tsx
import { useOnboardingTrigger } from '../../components/OnboardingModal';

export default function Dashboard() {
  const { triggerOnboarding } = useOnboardingTrigger();

  useEffect(() => {
    // Trigger onboarding for new users
    if (isNewUser) {
      triggerOnboarding('page-visit');
    }
  }, [isNewUser]);
}
```

### **4. Eligibility Checking**

Check if onboarding should show for a specific context:

```tsx
import { checkOnboardingEligibility } from '../../components/OnboardingModal';

if (checkOnboardingEligibility('page-visit')) {
  // Show contextual help
}
```

## 📋 **Available Steps**

The onboarding system tracks these steps:

1. **Profile** (`profile`) - Complete artist profile
2. **Sample Data** (`sample-data`) - Create example content
3. **Pitch** (`pitch`) - Generate first AI pitch
4. **Outreach** (`outreach`) - Track campaigns

## 🧪 **Testing**

### **Browser Console Commands**

```js
// Mark a step as active (modal will hide)
window.markStepActive('profile')

// Mark a step as completed (modal will show after 1 second)
window.markStepCompleted('profile')

// Trigger onboarding with context
window.showOnboardingWithContext('page-visit')

// Reset everything
window.resetOnboarding()

// Reopen onboarding
window.reopenOnboarding()
```

### **Manual Testing**

1. **New User Flow**:
   - Create a new account
   - Onboarding modal should appear
   - Click "Complete Profile" → modal hides, navigates to profile
   - Complete profile → modal appears to congratulate and guide to next step

2. **Active Work Protection**:
   - Start working on any step
   - Modal should not appear while working
   - Complete the step → modal appears for guidance

3. **Frequency Limits**:
   - Skip onboarding → won't show for 2 hours
   - Visit different pages → different frequency limits apply

## 🎨 **Customization**

### **Adding New Steps**

1. Add step to the `steps` array in `OnboardingModal.tsx`:

```tsx
{
  id: 'new-step',
  title: 'New Step',
  description: 'Description of the new step',
  action: 'Action Text',
  actionUrl: '/app/new-step',
  completed: false,
  priority: 5, // Higher number = higher priority
  icon: '🎯',
  color: 'bg-purple-500',
}
```

2. Add completion logic in `checkOnboardingStatus`:

```tsx
case 'new-step':
  return { ...step, completed: /* your completion logic */ };
```

### **Custom Frequency Limits**

Modify the `contextLimits` object in `shouldShowOnboarding`:

```tsx
const contextLimits = {
  'page-visit': 30 * 60 * 1000, // 30 minutes
  'feature-use': 15 * 60 * 1000, // 15 minutes
  'app-start': 2 * 60 * 60 * 1000, // 2 hours
  'custom-context': 60 * 60 * 1000, // 1 hour
};
```

## 🔧 **Best Practices**

### **When to Use Step Tracking**

✅ **Do track**:
- Form submissions
- Profile completions
- Feature usage
- Data creation

❌ **Don't track**:
- Page visits (use contextual triggers instead)
- Minor interactions
- Temporary states

### **Frequency Management**

- **Be respectful**: Don't overwhelm users
- **Be contextual**: Show guidance when relevant
- **Be progressive**: Increase frequency for active users
- **Be flexible**: Allow users to skip and return

### **User Experience**

- **Non-blocking**: Never prevent users from working
- **Helpful**: Provide value when guidance appears
- **Clear**: Make it obvious how to proceed
- **Optional**: Always allow users to skip

## 📊 **Analytics**

The onboarding system automatically tracks:

- Step completion rates
- Time spent on each step
- Skip rates
- Completion flow

Access analytics through the browser console:

```js
// View onboarding state
console.log(localStorage.getItem('onboarding_completed'))
console.log(localStorage.getItem('onboarding_last_shown'))
```

## 🐛 **Troubleshooting**

### **Modal Not Showing**

1. Check if user has completed onboarding:
   ```js
   localStorage.getItem('onboarding_completed') === 'true'
   ```

2. Check if step is marked as active:
   ```js
   // Should be null when not actively working
   console.log('Active step:', activeStepId)
   ```

3. Check frequency limits:
   ```js
   // Should be past the delay time
   const lastShown = localStorage.getItem('onboarding_last_shown')
   console.log('Time since last shown:', Date.now() - parseInt(lastShown))
   ```

### **Modal Showing Too Often**

1. Increase frequency limits in `contextLimits`
2. Check if `markStepActive` is being called properly
3. Verify step completion logic

### **Step Not Marking as Complete**

1. Ensure `markStepCompleted` is called after successful operations
2. Check that the step ID matches exactly
3. Verify the completion logic in `checkOnboardingStatus`

## 🔗 **Related Files**

- `components/OnboardingModal.tsx` - Main onboarding component
- `pages/_app.tsx` - Global onboarding provider
- `pages/app/profile.tsx` - Example step tracking implementation
- `pages/app/dashboard.tsx` - Example contextual triggers

## 📚 **References**

This onboarding system is based on industry best practices from:

- [Appcues Frequency Limiting](https://docs.appcues.com/user-experiences-targeting/experiences-frequency-limit)
- [Chameleon Recurrence System](https://help.chameleon.io/en/articles/1725396-using-recurrence-to-define-frequency)
- [Clay's Guided Modal](https://www.chameleon.io/inspiration/clay-guided-modal)
- [OnboardJS Best Practices](https://onboardjs.com/blog/first-onboarding-flow)
