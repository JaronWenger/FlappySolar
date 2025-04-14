const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Checking images in GitHub Pages branch...');

// Create a temporary directory
const tempDir = path.join(__dirname, 'temp-check');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir);

try {
  // Clone the gh-pages branch
  console.log('Cloning gh-pages branch...');
  execSync(`git clone -b gh-pages --single-branch https://github.com/JaronWenger/FlappySolar.git ${tempDir}`, { stdio: 'inherit' });
  
  // Check if src directory exists
  const srcDir = path.join(tempDir, 'src');
  if (!fs.existsSync(srcDir)) {
    console.log('src directory not found in gh-pages branch. Creating it...');
    fs.mkdirSync(srcDir);
  }
  
  // Check if image files exist
  const imageFiles = [
    'LOGO.png',
    'Background.jpg',
    'solar-panel.svg'
  ];
  
  let missingFiles = [];
  
  imageFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`Warning: ${file} not found in gh-pages branch`);
      missingFiles.push(file);
    } else {
      console.log(`Found ${file} in gh-pages branch`);
    }
  });
  
  // If there are missing files, copy them from the local src directory
  if (missingFiles.length > 0) {
    console.log('Copying missing files to gh-pages branch...');
    
    missingFiles.forEach(file => {
      const sourcePath = path.join(__dirname, 'src', file);
      const targetPath = path.join(srcDir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${file} to gh-pages branch`);
      } else {
        console.log(`Error: ${file} not found in local src directory`);
      }
    });
    
    // Commit and push changes
    console.log('Committing and pushing changes...');
    process.chdir(tempDir);
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Add missing image files"', { stdio: 'inherit' });
    execSync('git push origin gh-pages', { stdio: 'inherit' });
    
    console.log('Missing files added to gh-pages branch');
  } else {
    console.log('All image files are present in gh-pages branch');
  }
} catch (error) {
  console.error('Error checking images:', error);
} finally {
  // Clean up
  process.chdir(__dirname);
  fs.rmSync(tempDir, { recursive: true, force: true });
} 