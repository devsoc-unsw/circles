# Frontend 


## Deploying

Requirements before deploying: 
* Permission to access circles in Rancher (ask project director)
* SSL Certificate (ask project director)
* Space in docker hub

## Updating Docker Image

When circles wanted to deploy, there were no more spots in our CSESoc paid dockerhub :(

As a result, we have a free account which does not automatically build and push the changes to our public docker image, and consequently does not update our website through Rancher. 

Commands required to update Circles: 


> Note: BE is yet to be deployed
```
docker build -t circles2021/circles-prod:latest -f Dockerfile .
docker run -t circles2021/circles-prod:latest 
docker push circles2021/circles-prod:latest
```
Breakdown
* `build` creates a new docker image (kinda like a virtual env)
* `run` runs the commands given in the Dockerfile inside the newly creted image
* `push` pushes our created image to Dockerhub
* `circles2021` is our organisation name
* `circles-prod` is our Dockerhub repo name 
* `:latest` is a tag name (named latest by convention)
