import itertools
import json
import re
import requests
from collections import defaultdict, Counter
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from datetime import datetime
import os

# credentials contain:
bearer_token = "AAAAAAAAAAAAAAAAAAAAAAkEQQEAAAAAa0%2BWUWtFE1If8QMV6FBu6gseBX4%3D0G0VV7PpvMGp7F2uuoqPqsUvj9QyTnAYSC7q2hOaMHfaVcAaBV"

export_directory = "../sentiment-analysis-dashboard/src/"

# emoticons
def load_dict_smileys():
    return {
        ":‑)": "smiley",
        ":-]": "smiley",
        ":-3": "smiley",
        ":->": "smiley",
        "8-)": "smiley",
        ":-}": "smiley",
        ":)": "smiley",
        ":]": "smiley",
        ":3": "smiley",
        ":>": "smiley",
        "8)": "smiley",
        ":}": "smiley",
        ":o)": "smiley",
        ":c)": "smiley",
        ":^)": "smiley",
        "=]": "smiley",
        "=)": "smiley",
        ":-))": "smiley",
        ":‑D": "smiley",
        "8‑D": "smiley",
        "x‑D": "smiley",
        "X‑D": "smiley",
        ":D": "smiley",
        "8D": "smiley",
        "xD": "smiley",
        "XD": "smiley",
        ":‑(": "sad",
        ":‑c": "sad",
        ":‑<": "sad",
        ":‑[": "sad",
        ":(": "sad",
        ":c": "sad",
        ":<": "sad",
        ":[": "sad",
        ":-||": "sad",
        ">:[": "sad",
        ":{": "sad",
        ":@": "sad",
        ">:(": "sad",
        ":'‑(": "sad",
        ":'(": "sad",
        ":‑P": "playful",
        "X‑P": "playful",
        "x‑p": "playful",
        ":‑p": "playful",
        ":‑Þ": "playful",
        ":‑þ": "playful",
        ":‑b": "playful",
        ":P": "playful",
        "XP": "playful",
        "xp": "playful",
        ":p": "playful",
        ":Þ": "playful",
        ":þ": "playful",
        ":b": "playful",
        "<3": "love"
    }


# self defined contractions
def load_dict_contractions():
    return {
        "ain't": "is not",
        "amn't": "am not",
        "aren't": "are not",
        "can't": "cannot",
        "'cause": "because",
        "couldn't": "could not",
        "couldn't've": "could not have",
        "could've": "could have",
        "daren't": "dare not",
        "daresn't": "dare not",
        "dasn't": "dare not",
        "didn't": "did not",
        "doesn't": "does not",
        "don't": "do not",
        "e'er": "ever",
        "em": "them",
        "everyone's": "everyone is",
        "finna": "fixing to",
        "gimme": "give me",
        "gonna": "going to",
        "gon't": "go not",
        "gotta": "got to",
        "hadn't": "had not",
        "hasn't": "has not",
        "haven't": "have not",
        "he'd": "he would",
        "he'll": "he will",
        "he's": "he is",
        "he've": "he have",
        "how'd": "how would",
        "how'll": "how will",
        "how're": "how are",
        "how's": "how is",
        "I'd": "I would",
        "I'll": "I will",
        "I'm": "I am",
        "I'm'a": "I am about to",
        "I'm'o": "I am going to",
        "isn't": "is not",
        "it'd": "it would",
        "it'll": "it will",
        "it's": "it is",
        "I've": "I have",
        "kinda": "kind of",
        "let's": "let us",
        "mayn't": "may not",
        "may've": "may have",
        "mightn't": "might not",
        "might've": "might have",
        "mustn't": "must not",
        "mustn't've": "must not have",
        "must've": "must have",
        "needn't": "need not",
        "ne'er": "never",
        "o'": "of",
        "o'er": "over",
        "ol'": "old",
        "oughtn't": "ought not",
        "shalln't": "shall not",
        "shan't": "shall not",
        "she'd": "she would",
        "she'll": "she will",
        "she's": "she is",
        "shouldn't": "should not",
        "shouldn't've": "should not have",
        "should've": "should have",
        "somebody's": "somebody is",
        "someone's": "someone is",
        "something's": "something is",
        "that'd": "that would",
        "that'll": "that will",
        "that're": "that are",
        "that's": "that is",
        "there'd": "there would",
        "there'll": "there will",
        "there're": "there are",
        "there's": "there is",
        "these're": "these are",
        "they'd": "they would",
        "they'll": "they will",
        "they're": "they are",
        "they've": "they have",
        "this's": "this is",
        "those're": "those are",
        "'tis": "it is",
        "'twas": "it was",
        "wanna": "want to",
        "wasn't": "was not",
        "we'd": "we would",
        "we'd've": "we would have",
        "we'll": "we will",
        "we're": "we are",
        "weren't": "were not",
        "we've": "we have",
        "what'd": "what did",
        "what'll": "what will",
        "what're": "what are",
        "what's": "what is",
        "what've": "what have",
        "when's": "when is",
        "where'd": "where did",
        "where're": "where are",
        "where's": "where is",
        "where've": "where have",
        "which's": "which is",
        "who'd": "who would",
        "who'd've": "who would have",
        "who'll": "who will",
        "who're": "who are",
        "who's": "who is",
        "who've": "who have",
        "why'd": "why did",
        "why're": "why are",
        "why's": "why is",
        "won't": "will not",
        "wouldn't": "would not",
        "would've": "would have",
        "y'all": "you all",
        "you'd": "you would",
        "you'll": "you will",
        "you're": "you are",
        "you've": "you have",
        "Whatcha": "What are you",
        "luv": "love",
        "sux": "sucks"
    }


class TweetAnalysis:
    def __init__(self, username):
        self.username = username
        self.all_tweets = []  # list of dict, keys: 'text', 'created_at', 'id'
        self.processed_tweets = []
        self.word_freq = defaultdict(int)  # key: word, value: count
        self.account_activity = defaultdict(int)  # key: datetime, value: count
        self.like_count = defaultdict(int)
        self.retweet_count = defaultdict(int)
        self.result = {'pos': 0, 'neg': 0, 'neu': 0}
        self.sia = SentimentIntensityAnalyzer()

    def get_user_id(self):
        headers = {"Authorization": "Bearer {}".format(bearer_token)}
        url = "https://api.twitter.com/2/users/by/username/{}".format(self.username)
        response = requests.request("GET", url, headers=headers)
        return response.json()['data']['id']

    def get_all_tweets_from_username(self):
        all_tweets = []

        headers = {"Authorization": "Bearer {}".format(bearer_token)}
        id = self.get_user_id()
        url = "https://api.twitter.com/2/users/{}/tweets?max_results=100&tweet.fields=created_at,id,text,public_metrics".format(id)
        response = requests.request("GET", url, headers=headers)
        new_tweets = response.json()['data']
        all_tweets.extend(new_tweets)
        next_token = response.json()['meta']['next_token']

        while len(new_tweets) > 0:
            print("getting tweets next token {}".format(next_token))
            url = "https://api.twitter.com/2/users/{}/tweets?max_results=100&pagination_token={}&tweet.fields=created_at,id,text,public_metrics".format(id, next_token)
            response = requests.request("GET", url, headers=headers)
            if 'next_token' not in response.json()['meta'].keys():
                break
            next_token = response.json()['meta']['next_token']
            new_tweets = response.json()['data']
            all_tweets.extend(new_tweets)
            print("...{} tweets downloaded so far".format(len(all_tweets)))

        # write the json
        with open("{}_tweets.json".format(self.username), 'w') as f:
            json.dump({'data': all_tweets}, f)

        self.all_tweets = all_tweets

    def get_all_tweets_from_json(self, json_file):
        with open(json_file) as f:
            self.all_tweets = json.load(f)["data"]

    def cleaning_text(self, tweet):
        # Removal of hastags/account
        tweet = ' '.join(re.sub("(@[A-Za-z0-9_]+)|(#[A-Za-z0-9_]+)", " ", tweet).split())
        # Removal of address
        tweet = ' '.join(re.sub("(\w+:\/\/\S+)", " ", tweet).split())
        # Removal of Punctuation
        tweet = ' '.join(re.sub("[\.\,\!\?\:\;\-\=/]|(&amp)", " ", tweet).split())
        # Lower case
        tweet = tweet.lower()
        # CONTRACTIONS source: https://en.wikipedia.org/wiki/Contraction_%28grammar%29
        CONTRACTIONS = load_dict_contractions()
        tweet = tweet.replace("’", "'")
        words = tweet.split()
        reformed = [CONTRACTIONS[word] if word in CONTRACTIONS else word for word in words]
        tweet = " ".join(reformed)
        # Standardizing words
        tweet = ''.join(''.join(s)[:2] for _, s in itertools.groupby(tweet))
        # Deal with emoticons source: https://en.wikipedia.org/wiki/List_of_emoticons
        SMILEY = load_dict_smileys()
        words = tweet.split()
        reformed = [SMILEY[word] if word in SMILEY else word for word in words]
        tweet = " ".join(reformed)
        # Remove stopwords
        # tweet_tokens = word_tokenize(tweet)
        # stop_words = nltk.corpus.stopwords.words("english")
        # filtered_words = [w for w in tweet_tokens if not w in stop_words]
        # tweet = ' '.join(filtered_words)
        # Deal with emojis
        # tweet = emoji.demojize(tweet)
        # tweet = tweet.replace(":", " ")
        # tweet = ' '.join(tweet.split())

        return tweet

    def calculate_tweet_sentiment(self, tweet):
        text = tweet['text']
        # print(text)
        processed_text = self.cleaning_text(text)
        # print(processed_text)
        processed_tweet = tweet.copy()
        processed_tweet['text'] = processed_text
        self.processed_tweets.append(processed_tweet)

        score = self.sia.polarity_scores(processed_text)
        # print(score)

        if score['compound'] > 0.05:
            self.result['pos'] += 1
        elif score['compound'] < -0.05:
            self.result['neg'] += 1
        else:
            self.result['neu'] += 1

        words = processed_text.split(' ')
        stop_words = nltk.corpus.stopwords.words("english")
        for w in words:
            if w not in stop_words:
                self.word_freq[w] += 1

    def generate_analysis_file(self, filename=None):
        if not filename:
            filename = "{}_tweet_analysis.json".format(self.username)
        print("analysing {} tweets".format(len(self.all_tweets)))
        for tweet in self.all_tweets:
            self.calculate_tweet_sentiment(tweet)
            time_text = tweet['created_at']
            date = datetime.strptime(time_text, '%Y-%m-%dT%H:%M:%S.%fZ').strftime("%x")
            self.account_activity[date] += 1

            metrics = tweet['public_metrics']
            retweet_count = metrics['retweet_count']
            self.retweet_count[date] += retweet_count
            like_count = metrics['like_count']
            self.like_count[date] += like_count

        # process account activity
        activity_list = []
        for k, v in self.account_activity.items():
            activity_list.append([k, v, self.like_count[k], self.retweet_count[k]])

        def sort_by_date(e):
            return datetime.today() - datetime.strptime(e[0], '%x')
        activity_list.sort(key=sort_by_date)

        sorted_activity_list = []
        for date, count, like_count, retweet_count in activity_list:
            sorted_activity_list.append({
                'date': date,
                'count': count,
                'like': like_count,
                'retweet': retweet_count
            })

        k = Counter(self.word_freq)
        high = k.most_common(50)
        word_freq = []
        for element in high:
            word_freq.append({'text': element[0], 'value': element[1]})

        with open(os.path.join(export_directory, filename), 'w') as f:
            json_data = {'sentiment_count': self.result,
                         'word_freq': word_freq,
                         'account_activity': sorted_activity_list}
            json.dump(json_data, f)

        with open(filename, 'w') as f:
            json_data = {'sentiment_count': self.result,
                         'word_freq': word_freq,
                         'account_activity': sorted_activity_list}
            json.dump(json_data, f)

        # with open("{}_processed_tweet.json".format(self.username), 'w') as f:
        #     json_data = {'data': self.processed_tweets}
        #     json.dump(json_data, f)


def main():
    nltk.download([
        "names",
        "stopwords",
        "state_union",
        "averaged_perceptron_tagger",
        "vader_lexicon",
        "punkt",
    ])

    dumper = TweetAnalysis("certikorg")
    dumper.get_all_tweets_from_username()
    # dumper.get_all_tweets_from_json("certikorg_tweets.json")
    dumper.generate_analysis_file()


if __name__ == '__main__':
    main()
