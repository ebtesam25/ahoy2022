import os
import pymongo
import json
import random
import hashlib
import time

import requests

from hashlib import sha256

from math import radians, cos, sin, asin, sqrt, pi

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles. Determines return value units.
    return c * r


def getpoints(x0, y0, num, radius):
    # radius = 100                         #Choose radius
    radiusInDegrees=radius/111300            
    r = radiusInDegrees
    # x0 = 40.84
    # y0 = -73.87

    lats = []
    lons = []

    for i in range(1,num):                 #Choose number of points to be generated

        u = float(random.uniform(0.0,1.0))
        v = float(random.uniform(0.0,1.0))

        w = r * sqrt(u)
        t = 2 * pi * v
        x = w * cos(t) 
        y = w * sin(t)
        
        xLat  = x + x0
        yLong = y + y0

        lats.append(xLat)
        lons.append(yLong)
    
    return lats, lons



def sendsms(tonum, message):


    url = "https://us-central1-aiot-fit-xlab.cloudfunctions.net/sendsms"

    payload = json.dumps({
    "receiver": tonum,
    "message": message,
    "token": "REDACTED"
    })
    headers = {
    'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    # print(response.text)


def hashthis(st):


    hash_object = hashlib.md5(st.encode())
    h = str(hash_object.hexdigest())
    return h



def dummy(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    if request.method == 'OPTIONS':
        # Allows GET requests from origin https://mydomain.com with
        # Authorization header
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '3600',
            'Access-Control-Allow-Credentials': 'true'
        }
        return ('', 204, headers)

    # Set CORS headers for main requests
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
    }

    request_json = request.get_json()



    receiver_public_key = os.environ.get('ownpublic')

    mongostr = os.environ.get('MONGOSTR')
    client = pymongo.MongoClient(mongostr)
    db = client["hacksparrow"]


    retjson = {}

    action = request_json['action']



    if action == "getuseridfromphone":
        col = db.users

        for x in col.find():
            if x['phone'] == request_json['phone']:
                retjson['status'] = "found"
                retjson['name'] = x['name']
                retjson['id'] = x['id']
                retjson['balance'] = x['balance']

                return json.dumps(retjson)

        retjson['status'] = "unknown"
        retjson['name'] = "none"
        retjson['id'] = "-1"

        return json.dumps(retjson)

    if action == "getstatus":
        col = db.status

        for x in col.find():
            if x['userid'] == request_json['userid']:
                retjson['status'] = x['status']

                return json.dumps(retjson)
        
        return json.dumps(retjson)



    if action == "getuserscore":
        col = db.greenscores

        scores = []

        for x in col.find():
            if x['id'] == request_json['userid']:

                retjson['score'] = x['score']
                # retjson['weeklymiles'] = x['weekly']

                scores.append(retjson)

        
        retjson2 = {}

        retjson2['scores'] = scores
        return json.dumps(retjson2)


    if action == "endgame":

        playername = request_json['playername']
        score = request_json['score']
        code = request_json['code']

        col = db.games
        col.update_one({"invitecode": request_json['code']}, {"$set":{"status":"ended"}})

        col = db.gamescores

        maxid = 1
        
        for x in col.find():
            id = x["id"]
            maxid +=1
        id = str(maxid+1)

        payload = {}
        payload['id'] = id
        payload['code'] = request_json['code']
        payload['playername'] = playername
        payload['score'] = score

        result = col.insert_one(payload)

        col = db.users

        for x in col.find():
            if x['name'] == playername:
                col.update_one({'name': request_json['playername']}, {'$inc': {'totalscore': request_json['score']}})
                if x['hiscore'] < request_json['score']:
                    col.update_one({'name': request_json['playername']}, {'$set': {'hiscore': request_json['score']}})
                    sendsms(x['phone'], "congratulations, you have set a new personal high schore with captain hack sparrow!")
                    break
        

        retjson['gamestatus'] = "ended"
        return json.dumps(retjson)




    if action == "startgame":


        x0 = request_json['loc']['lat']
        y0 = request_json['loc']['lng']

        lats, lons = getpoints(x0, y0, 20, 200)

        items = []

        for x, y in zip(lats, lons):
            item = {}
            item['itemid'] = str(random.randint(1,9))
            item['lat'] = str(x)
            item['lng'] = str(y)
            items.append(item)
        
            


        col = db.games

        col.update_one({"invitecode": request_json['code']}, {"$set":{"status":"started"}})




        retjson['items'] = items
        return json.dumps(retjson)





    if action == "creategame":
        
        maxid = 1
        col = db.games
        for x in col.find():
            id = x["id"]
            maxid +=1
        id = str(maxid+1)


        number = random.randint(1000,9999)

        invitecode = request_json['name'] + str(number)

        payload = {}

        uid = id 
        payload["id"] = id
        # payload["uid"] = request_json['uid']
        # payload["name"] = request_json['name']
        players = []
        pl = {}
        pl['name'] = request_json['name']
        pl['score'] = 0
        players.append(pl)
        payload["name"] = request_json['name']
        payload["invitecode"] = invitecode
        payload["creator"] = request_json['name']
        payload["phone"] = request_json['phone']
        payload["status"] = "created"

        payload["players"] = players
        
        gid = id
        
        result=col.insert_one(payload)

        maxid = 1
        col = db.users
        for x in col.find():
            id = x["id"]
            maxid +=1
            if x['name'] == request_json['name']:
                maxid = 0
                break
        
        if maxid != 0:

            id = str(maxid+1)
            payload = {}
            payload['id'] = id
            payload['phone'] = request_json['phone']
            payload["name"] = request_json['name']
            payload["hiscore"] = 0
            payload["totalscore"] = 0
            result=col.insert_one(payload)
        


        retjson = {}

        # retjson['dish'] = userid
        retjson['status'] = "successfully added"
        retjson['gameid'] = gid
        retjson['invitecode'] = invitecode
        

        return json.dumps(retjson)



    if action == "getallitems":
        col = db.items

        data = []

        for x in col.find():
            ami = {}
            
            ami["id"] = x["id"]
            ami["name"] = x["name"]
            ami["description"] = x["description"]
            ami["points"] = x["points"]
            ami["url"] = x["url"]

            
            data.append(ami)

        retjson['items'] = data

        return json.dumps(retjson)



    if action == "getallusers":
        col = db.users

        data = []

        for x in col.find():
            ami = {}
            
            ami["id"] = x["id"]
            ami["name"] = x["name"]
            
            ami["details"] = x["details"]
            ami["phone"] = x["phone"]
            ami["imageurl"] = x["imageurl"]
            ami['balance'] = x['balance']

            
            data.append(ami)

        retjson['users'] = data

        return json.dumps(retjson)




    if action == "getuserdata":
        col = db.users
        for x in col.find():
            if int(x['id']) == int(request_json['userid']):
                name = x['name']

                address = x['address']


                retjson = {}

                # retjson['dish'] = userid
                retjson['status'] = "success"
                retjson['name'] = name
                retjson['address'] = address                
                retjson['email'] = x['email']
                retjson['phone'] = x['phone']
                

                return json.dumps(retjson)
        retjson = {}

        # retjson['dish'] = userid
        retjson['status'] = "fail"
        retjson['id'] = "-1"

        return json.dumps(retjson)


    if action == "updateuserdata":
        col = db.users
        for x in col.find():
            if int(x['id']) == int(request_json['id']):
                if 'name' in request_json:
                    col.update_one({"id": x['id']}, {"$set":{"name":request_json['name']}})
                if 'gender' in request_json:
                    col.update_one({"id": x['id']}, {"$set":{"gender":request_json['gender']}})
                if 'type' in request_json:
                    col.update_one({"id": x['id']}, {"$set":{"type":request_json['type']}})
                    
                # status = x['status']
                # diet = x['diet']
                # allergy = x['allergy']

                retjson = {}

                # retjson['dish'] = userid
                retjson['responsestatus'] = "success"
                # retjson['status'] = status
                # retjson['diet'] = diet
                # retjson['allergy'] = allergy
                

                return json.dumps(retjson)
        retjson = {}

        # retjson['dish'] = userid
        retjson['status'] = "fail"
        retjson['id'] = "-1"

        return json.dumps(retjson)





    if action == "register" :
        maxid = 1
        col = db.users
        for x in col.find():
            id = x["id"]
            maxid +=1
        id = str(maxid+1)

        payload = {}

        uid = id 
        payload["id"] = id
        # payload["uid"] = request_json['uid']
        # payload["name"] = request_json['name']
        payload["name"] = request_json['name']
        payload["email"] = request_json['email']
        payload["phone"] = request_json['phone']

        # payload['address'] = request_json['address']

        payload["password"] = request_json['password']


        
        result=col.insert_one(payload)

        retjson = {}

        # retjson['dish'] = userid
        retjson['status'] = "successfully added"
        retjson['userid'] = id

        return json.dumps(retjson)


    if action == "login":
        col = db.users
        for x in col.find():
            if x['email'] == request_json['email'] and x['password'] == request_json['password']:
                userid = x['id']
                name = x['name']
                retjson = {}

                # retjson['dish'] = userid
                retjson['status'] = "success"
                retjson['name'] = name
                retjson['userid'] = userid
                

                return json.dumps(retjson)
        retjson = {}

        # retjson['dish'] = userid
        retjson['status'] = "fail"
        retjson['userid'] = "-1"

        return json.dumps(retjson)



    if action == "additem":
        
        maxid = 0
        col = db.items
        for x in col.find():
            id = x["id"]
            maxid +=1
        id = str(maxid+1)

        payload = {}

        uid = id 
        payload["id"] = id
        # payload["uid"] = request_json['uid']
        payload["description"] = request_json['description']
        payload["name"] = request_json['name']
        payload["points"] = request_json['points']
        payload["url"] = request_json['url']
        
        result=col.insert_one(payload)
        
        col = db.system

        col.update_one({'id': "0"}, {'$inc': {'numitems': 1}})


        retjson = {}

        # retjson['dish'] = userid
        retjson['status'] = "successfully added"
        retjson['markerid'] = id

        return json.dumps(retjson)



    retstr = "action not done"

    if request.args and 'message' in request.args:
        return request.args.get('message')
    elif request_json and 'message' in request_json:
        return request_json['message']
    else:
        return retstr
