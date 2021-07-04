kubectl delete pod cetus-web
kubectl apply -f ./pod.yaml
kubectl expose pod cetus-web --port=80 --target-port=80
