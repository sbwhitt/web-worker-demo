echo "BUILD STARTED FROM SHELL SCRIPT"

# clear old build folder
rm -rf ./docs

# https://stackoverflow.com/questions/59341718/not-allowed-to-load-local-resource-error-on-chrome-angular-app-is-not-running
# https://stackoverflow.com/questions/42292761/angular-cli-build-with-base-href-also-return-programs-folder-when-using-git-bash
ng build --output-path docs --base-href '//cardo\'

# rearrange the build files.....
mv ./docs/browser/* ./docs
rm -rf ./docs/browser

# making angular routing work with gh pages
# https://stackoverflow.com/questions/60824483/angular-8-weird-routing-issue-after-deployed-to-github-pages
cp ./docs/index.html ./docs/404.html
