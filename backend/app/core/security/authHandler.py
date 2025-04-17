import jwt
from decouple import config
import time

JWT_SECRET = config("JWT_SECRET")
JWT_ALGORITHM = config("JWT_ALGORITHM")

class AuthHandler(object):

    @staticmethod
    def sign_jwt(user_id : int) -> str:
        payload = {
            "user_id" : user_id,
            "expires" : time.time() + 900
        }

        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return token
    
    @staticmethod
    def decode_jwt(token : str) -> dict:
        try:
            decode_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return decode_token if decode_token["expires"] >= time.time() else None
        except:
            print("unable to decode the token")