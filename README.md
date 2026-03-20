**The Memory Box** is a modern app designed to help you preserve, relive, and share your cherished moments in style. With features like capsule creation, collaboration, gifting, and even an experimental AI-powered face detection, it’s the perfect way to keep your memories alive.

![HomePage](https://github.com/user-attachments/assets/d8fa274a-b126-4605-b7ad-d25eadbdbb72)

## Features

1. **Secure Authentication**
   - Powered by **NextAuth.js** and **NeonDB**, your memories stay private and safe.

2. **Beautiful Home Page**
   - Your photos are displayed in a clean and visually pleasing layout.
   - Includes a handy **date picker** to revisit events on specific days.

3. **Easy File Uploads**
   - Integrated with **Cloudinary**, making it super simple to upload photos, videos, and even audio files. It takes care of compression and optimization automatically.

4. **Albums & Collaboration**
   - Group your favorite photos into albums and share them with friends or family for collaboration.
   - Uses **Resend Mail API** and **React Email** templates to notify collaborators in style.

5. **Capsules for Special Moments**
   - Turn albums into time capsules with:
     - **Countdown timers**
     - **Customizable themes**
     - **Password protection**
   - Perfect for personal goals, nostalgic keepsakes, or reminders of special events.

6. **Gift Capsules**
   - Share your memories with loved ones by gifting them capsules.
   - Ownership of the capsule and its album is transferred seamlessly, adding a personal touch.

7. **ML-Based Face Detection** *(Experimental)*
   - Automatically groups photos of the same person using machine learning techniques.
   - Create custom videos or albums for each person based on these groups.

8. **Modern UI/UX**
   - A sleek and responsive design ensures an effortless user experience across devices.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 3, Lucide icons, Radix UI primitives
- **Database / ORM:** Prisma (Prisma Client + CLI)
- **File/storage:** Cloudinary via `cloudinary` and `next-cloudinary`
- **Authentication / Email:** Custom auth utilities, `nodemailer` for email
- **Forms & Validation:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **Build / Tooling:** Node.js, pnpm/npm, PostCSS, Autoprefixer

## Dev / Build Tools and Libraries

- ESLint for linting
- TypeScript for type checking
- Tailwind CSS and `tailwindcss-animate`
- `formidable` for server-side file parsing
- `jszip` for any zip/export features
- `class-variance-authority`, `clsx`, and `tailwind-merge` for styling utilities

## Other Tools & Services

- Cloudinary (asset storage and CDN)


That’s all for now. Relive and share your memories with **The Memory Box**!
