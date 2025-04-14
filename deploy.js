const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a temporary directory for deployment
const tempDir = path.join(__dirname, 'temp-deploy');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir);

// Copy all necessary files to the temporary directory
const filesToCopy = [
  'index.html',
  'style.css',
  'game.js',
  'server.js',
  'package.json',
  'README.md'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(
      path.join(__dirname, file),
      path.join(tempDir, file)
    );
  }
});

// Create src directory in temp
const srcDir = path.join(tempDir, 'src');
fs.mkdirSync(srcDir);

// Copy all files from src directory
const srcFiles = fs.readdirSync(path.join(__dirname, 'src'));
srcFiles.forEach(file => {
  fs.copyFileSync(
    path.join(__dirname, 'src', file),
    path.join(srcDir, file)
  );
});

// Deploy to GitHub Pages
console.log('Deploying to GitHub Pages...');
try {
  // Change to the temp directory
  process.chdir(tempDir);
  
  // Initialize git repository
  execSync('git init', { stdio: 'inherit' });
  
  // Add all files
  execSync('git add .', { stdio: 'inherit' });
  
  // Commit changes
  execSync('git commit -m "Deploy to GitHub Pages"', { stdio: 'inherit' });
  
  // Add remote if it doesn't exist
  try {
    execSync('git remote get-url origin', { stdio: 'inherit' });
  } catch (e) {
    execSync('git remote add origin https://github.com/JaronWenger/FlappySolar.git', { stdio: 'inherit' });
  }
  
  // Push to gh-pages branch
  execSync('git push -f origin master:gh-pages', { stdio: 'inherit' });
  
  console.log('Deployment successful!');
} catch (error) {
  console.error('Deployment failed:', error);
} finally {
  // Clean up
  process.chdir(__dirname);
  fs.rmSync(tempDir, { recursive: true, force: true });
} 