const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Checking GitHub Pages deployment...');

// Create a temporary directory
const tempDir = path.join(__dirname, 'temp-gh-pages');
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
  
  // Copy all files from local src to gh-pages src
  console.log('Copying files to gh-pages branch...');
  const localSrcDir = path.join(__dirname, 'src');
  const files = fs.readdirSync(localSrcDir);
  
  files.forEach(file => {
    const sourcePath = path.join(localSrcDir, file);
    const targetPath = path.join(srcDir, file);
    
    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${file} to gh-pages branch`);
    }
  });
  
  // Commit and push changes
  console.log('Committing and pushing changes...');
  process.chdir(tempDir);
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Fix image files"', { stdio: 'inherit' });
  execSync('git push origin gh-pages', { stdio: 'inherit' });
  
  console.log('GitHub Pages deployment fixed successfully!');
} catch (error) {
  console.error('Error fixing GitHub Pages deployment:', error);
} finally {
  // Clean up
  process.chdir(__dirname);
  fs.rmSync(tempDir, { recursive: true, force: true });
} 