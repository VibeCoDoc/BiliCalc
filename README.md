# BiliCalc - Deployment Instructions

## Option 1: GitHub Actions (Recommended)

1.  Go to your GitHub repository **Settings**.
2.  Click on **Pages** in the left sidebar.
3.  Under **Build and deployment** > **Source**, select **GitHub Actions**.
4.  The workflow will automatically build and deploy your site.

## Option 2: Manual Deployment (gh-pages)

1.  Run `npm run deploy` locally.
2.  Go to your GitHub repository **Settings**.
3.  Click on **Pages** in the left sidebar.
4.  Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5.  Select the `gh-pages` branch and click **Save**.
