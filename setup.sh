docker build -f="dockerfile" -t="devtooldocker7585/cetusclient:v1" .
docker run --rm -d -p 3000:80/tcp devtooldocker7585/cetusclient:v1