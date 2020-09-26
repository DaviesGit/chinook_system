
BUILD_DIR=`dirname $0`/build
rm $BUILD_DIR -dr
mkdir $BUILD_DIR
cd $BUILD_DIR
cmake ../ && 
make &&
cd - &&
mv "$BUILD_DIR/bin/chinook_server" "$1" &&
echo All done!

