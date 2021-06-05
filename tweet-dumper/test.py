import unittest
import requests

consumer_key = "XxXggAKbb42tkdWCgb13nEAbc"
consumer_secret = "JyMQ1gNjPbG5ABozYvgfUAEKuerIN0OdVdYRXPJDTm9tsdzqSK"
access_token = "1399852020400525320-2aywYdLLe7juP8qz08VctVCzgHWCl5"
token_secret = "2lByLalcpUm5EPENPi1DfLyDbqOH1gA1w1dfhdNCrvT61"
bearer_token = "AAAAAAAAAAAAAAAAAAAAAAkEQQEAAAAAa0%2BWUWtFE1If8QMV6FBu6gseBX4%3D0G0VV7PpvMGp7F2uuoqPqsUvj9QyTnAYSC7q2hOaMHfaVcAaBV"

class MyTestCase(unittest.TestCase):
    def test_something(self):
        self.assertEqual(True, False)

    def test_request(self):
        headers = {"Authorization": "Bearer {}".format(bearer_token)}
        username = "certikorg"
        url = "https://api.twitter.com/2/users/by/username/{}".format(username)
        response = requests.request("GET", url, headers=headers)
        print(response.json())

    def test_get_tweet(self):
        headers = {"Authorization": "Bearer {}".format(bearer_token)}
        id = "1232319080637616128"
        url = "https://api.twitter.com/2/users/{}/tweets?max_results=100&tweet.fields=created_at,id,text".format(id)
        response = requests.request("GET", url, headers=headers)
        print(response.json())


if __name__ == '__main__':
    unittest.main()
