const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Uploading image files to GitHub Pages...');

// Create a temporary directory
const tempDir = path.join(__dirname, 'temp-upload');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir);

try {
  // Clone the gh-pages branch
  console.log('Cloning gh-pages branch...');
  execSync(`git clone -b gh-pages --single-branch https://github.com/JaronWenger/FlappySolar.git ${tempDir}`, { stdio: 'inherit' });
  
  // Create src directory if it doesn't exist
  const srcDir = path.join(tempDir, 'src');
  if (!fs.existsSync(srcDir)) {
    console.log('Creating src directory...');
    fs.mkdirSync(srcDir);
  }
  
  // Copy image files
  console.log('Copying image files...');
  const imageFiles = [
    'LOGO.png',
    'Background.jpg',
    'solar-panel.svg'
  ];
  
  imageFiles.forEach(file => {
    const sourcePath = path.join(__dirname, 'src', file);
    const targetPath = path.join(srcDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${file} to gh-pages branch`);
    } else {
      console.log(`Warning: ${file} not found in src directory`);
    }
  });
  
  // Commit and push changes
  console.log('Committing and pushing changes...');
  process.chdir(tempDir);
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Add image files"', { stdio: 'inherit' });
  execSync('git push origin gh-pages', { stdio: 'inherit' });
  
  console.log('Image files uploaded successfully!');
} catch (error) {
  console.error('Error uploading image files:', error);
} finally {
  // Clean up
  process.chdir(__dirname);
  fs.rmSync(tempDir, { recursive: true, force: true });
} 