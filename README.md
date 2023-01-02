# happyCow-back

## MongoDB Models :

1) Restaurants

{  
  placeId: Number,  
  name: String,  
  address: String,  
  location: {  
    lng: Number,  
    lat: Number,  
  },  
  phone: String,  
  thumbnail: String,  
  type: String,  
  category: Number,  
  rating: Number,  
  vegan: Number,  
  vegOnly: Number,  
  link: String,  
  description: String,  
  pictures: Array,  
  price: String,  
  website: String,  
  facebook: String,  
  nearbyPlacesIds: Array,  
}  


2) Users

{  
  email: String,  
  account: {  
    username: String,  
    avatar: Object,  
  },  
  favorites: Array,  
  token: String,  
  hash: String,  
  salt: String,  
}  


## Routes

1) Search a list of shops

Type : GET  
Route : /restaurants  
Query :  
    - string   
    - nameOnly (boolean)  
    - address  
    - category  (separated by "+" if several)    
    - type  (separated by "+" if several)  
    - rating  (number)  
    - vegan  (boolean)  
    - vegOnly  (boolean)  
    - page  (number)  
    - nbPerPage  (number)  
    

2) Search One shop by id  

Type : GET  
Route : /restaurant/:id  
Params :  
    - id  (for MongoDB id)  
    - "placeId="+id  (for HappyCow id)  
    

3) Create user  

Type : POST  
Route : /user/signup  
Params :  
    - username   
    - email  
    - password  
    - files.picture  (avatar picture)  
    

4) login  

Type : POST  
Route : /user/login  
Params :  
    - email  
    - password  
    
    
5) update user  

Type : PUT  
Route : /user/update  
Bearer Token  
Body : 
    - email  
    - username  
    - favorites  (Array)  
    - modifyAvatar  (boolean)  
    - files.picture  (avatar picture to modify)  


6) read user

Type : GET  
Route : /user/read  
Bearer Token  

