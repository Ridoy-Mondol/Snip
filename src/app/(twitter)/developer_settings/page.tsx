"use client";
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/app/(twitter)/layout";
import { Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Typography, Container, Box, Button } from "@mui/material";
import { AiOutlineDown } from "react-icons/ai"; 
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MdPostAdd, MdOutlineWest, MdDelete } from "react-icons/md"; 

const ApiDocs = () => {
const [apiKey, setApiKey] = useState<string>("");
const { token } = useContext(AuthContext);
const createTweetExample = `
const formData = new FormData();
formData.append("text", "This is my tweet!");
const res = await fetch('/api/public/tweet/create_tweet', {
  method: 'POST',
  headers: { 'x-api-key': 'YOUR_API_KEY' },
  body: formData
});`;

const createTweetsResponse = `{
    "success": true,
    "message": "Tweet created successfully."
  }`;

const getTweetExample = `
const res = await fetch('/api/public/tweet/get_tweet', {
  method: 'GET',
  headers: { 'x-api-key': 'YOUR_API_KEY' },
});`;

const getTweetsResponse = `{
    "success": true,
    "data": [
      {
        "id": "3a312ba3-3d54-404d-9d79-7625cc8e2a66",
        "text": "This is a sample tweet text",
        "createdAt": "2024-12-05T11:11:46.165Z",
        "authorId": "994dc575-ef8a-4665-8f11-add746f8c590",
        "photoUrl": "https://example.com/image.jpg",
        "isRetweet": false,
        "retweetOfId": null,
        "isReply": false,
        "repliedToId": null,
        "isPoll": false,
        "pollExpiresAt": null,
        "totalVotes": 0,
        "pollOptions": []
      },
      {
        "id": "238bdff2-7e12-4d8a-9a66-0b66f581df9a",
        "text": "What is your favorite color?",
        "createdAt": "2024-12-05T15:41:57.945Z",
        "authorId": "994dc575-ef8a-4665-8f11-add746f8c590",
        "photoUrl": null,
        "isRetweet": false,
        "retweetOfId": null,
        "isReply": false,
        "repliedToId": null,
        "isPoll": true,
        "pollExpiresAt": "2024-12-05T17:11:57.939Z",
        "totalVotes": 0,
        "pollOptions": [
          {
            "id": "b7a6568a-c5be-4f9d-8063-1380eae8dc4d",
            "text": "Red",
            "votes": 0,
            "tweetId": "238bdff2-7e12-4d8a-9a66-0b66f581df9a"
          },
          {
            "id": "2054a78d-b2e2-46d3-ace3-4129a8fbccce",
            "text": "Blue",
            "votes": 0,
            "tweetId": "238bdff2-7e12-4d8a-9a66-0b66f581df9a"
          },
          {
            "id": "d67a6582-190b-4909-b8c8-77c87d6979c1",
            "text": "Green",
            "votes": 0,
            "tweetId": "238bdff2-7e12-4d8a-9a66-0b66f581df9a"
          }
        ]
      }
    ]
  }`;
  

const getSingleTweet = `
const res = await fetch("/api/public/tweet/get_single_tweet/tweetId", {
  method: 'GET',
  headers: { 'x-api-key': 'YOUR_API_KEY' },
});`;

  const getSingleTweetExample = `{
  "success": true,
  "message": "Tweet fetched successfully.",
  "data": {
        "id": "b41b8af1-5165-4e3a-b7e4-10058d3506e4",
        "text": "This is an example tweet fetched from the API.",
        "createdAt": "2024-12-05T10:30:00.000Z",
        "authorId": "994dc575-ef8a-4665-8f11-add746f8c590",
        "photoUrl": "https://example.com/photo.jpg",
        "isRetweet": false,
        "retweetOfId": null,
        "isReply": false,
        "repliedToId": null,
        "isPoll": false,
        "pollExpiresAt": null,
        "totalVotes": 0,
        "pollOptions": []
    }
}`;

const updateTweet = `
const res = await fetch('/api/public/tweet/update_tweet/tweetID', {
  method: 'PATCH',
  headers: { 'x-api-key': 'YOUR_API_KEY' },
  body: JSON.stringify({ text: "New tweet text" }),
});`;

  const updateTweetExample = `{
    "success": true,
    "message": "Tweet updated successfully."
}`;

const deleteTweet = `
const res = await fetch('/api/public/tweet/delete_tweet/tweetID', {
  method: 'DELETE',
  headers: { 'x-api-key': 'YOUR_API_KEY' },
});`;

  const deleteTweetExample = `{
    "success": true,
    "message": "Tweet deleted successfully."
}`;

const fetchApiKey = async () => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Add userId to headers only if it's defined
        if (token?.id) {
            headers["userId"] = token.id;
        }

        const res = await fetch("/api/auth/apiKey", {
            method: "GET",
            headers,
        });

        const data = await res.json();
        if (data.success) {
            setApiKey(data.apiKey);
        }
    } catch (err) {
        console.error("Error fetching API key:", err);
    }
};

useEffect(() => {
    fetchApiKey();
}, [token]);


  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h3" gutterBottom>
        Snip API Documentation
      </Typography>
      <Typography variant="body1" gutterBottom>
        This API allows you to manage tweets in the application, including creating, fetching, and deleting tweets.
      </Typography>

      {/* Create Tweet Section */}
      <Accordion>
        <AccordionSummary expandIcon={<AiOutlineDown style={{ fontSize: 24 }} />}>
          <Typography variant="h6">
            <MdPostAdd style={{ marginRight: 8 }} />
            Create a Tweet
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">
            <strong>Endpoint:</strong> POST /api/public/tweet/create_tweet
          </Typography>
          <Typography variant="body1">
            <strong>Headers:</strong>
            <ul>
              <li>x-api-key: Your API Key</li>
              <li>Content-Type: multipart/form-data</li>
            </ul>
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Guidelines:</strong> To create a tweet or poll, send a POST request with multipart/form-data as the content type. The request should include either text (string) for the tweet content or poll (stringified JSON object) for poll details. You can only include one of these, not both. If creating a tweet, the text field is required. If creating a poll, the poll field should include a question (string), options (array of strings), and an optional length (object with days, hours, and/or minutes for expiration). Optionally, you can include isReply (boolean) and repliedToId (string) if it`&apos;`s a reply to another tweet. For an image, include the photo field with the image file. Authentication requires an x-api-key header.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Sample Request:</strong>
          </Typography>
          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="javascript" style={materialDark}>
              {createTweetExample}
            </SyntaxHighlighter>
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(createTweetExample)}
          >
            Copy Request Code
          </Button>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Response:</strong>
          </Typography>
          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="json" style={materialDark}>
              {createTweetsResponse}
            </SyntaxHighlighter>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Get Tweets Section */}
      <Accordion>
        <AccordionSummary expandIcon={<AiOutlineDown style={{ fontSize: 24 }} />}>
          <Typography variant="h6">
            <MdOutlineWest style={{ marginRight: 8 }} />
            Fetch All Tweets
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">
            <strong>Endpoint:</strong> GET /api/public/tweet/get_tweets
          </Typography>
          <Typography variant="body1">
            <strong>Headers:</strong>
            <ul>
              <li>x-api-key: Your API Key</li>
            </ul>
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Guidelines:</strong> To fetch all tweets, send a GET request to the endpoint with an x-api-key in the request headers for authentication
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Sample Request:</strong>
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="javascript" style={materialDark}>
              {getTweetExample}
            </SyntaxHighlighter>
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(getTweetExample)}
          >
            Copy Request Code
          </Button>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Response:</strong>
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="json" style={materialDark}>
              {getTweetsResponse}
            </SyntaxHighlighter>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Get Single Tweet Section */}
      <Accordion>
        <AccordionSummary expandIcon={<AiOutlineDown style={{ fontSize: 24 }} />}>
          <Typography variant="h6">
            <MdOutlineWest style={{ marginRight: 8 }} />
            Fetch Single Tweet
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">
            <strong>Endpoint:</strong> GET /api/public/tweet/get_single_tweet/:tweetId
          </Typography>
          <Typography variant="body1">
            <strong>Headers:</strong>
            <ul>
              <li>x-api-key: Your API Key</li>
            </ul>
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Guidelines:</strong> To fetch a tweet, send a GET request to the endpoint with an x-api-key in the request headers for authentication. Include the tweetId in the URL path
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Sample Request:</strong>
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="javascript" style={materialDark}>
              {getSingleTweet}
            </SyntaxHighlighter>
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(getSingleTweet)}
          >
            Copy Request Code
          </Button>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Response:</strong>
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="json" style={materialDark}>
              {getSingleTweetExample}
            </SyntaxHighlighter>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Update Tweet Section */}
      <Accordion>
        <AccordionSummary expandIcon={<AiOutlineDown style={{ fontSize: 24 }} />}>
          <Typography variant="h6">
            <MdPostAdd style={{ marginRight: 8 }} />
            Update a Tweet
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">
            <strong>Endpoint:</strong> PATCH /api/public/tweet/update_tweet/:tweetId
          </Typography>
          <Typography variant="body1">
            <strong>Headers:</strong>
            <ul>
              <li>x-api-key: Your API Key</li>
              <li>Content-Type: application/json</li>
            </ul>
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Guidelines:</strong> To update a tweet, send a PATCH request to the endpoint with an x-api-key in the request headers for authentication. Include the tweetId in the URL path. Include the updated body in the request body. You can only update the tweet text.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Sample Request:</strong>
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="javascript" style={materialDark}>
              {updateTweet}
            </SyntaxHighlighter>
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(updateTweet)}
          >
            Copy Request Code
          </Button>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Response:</strong>
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="json" style={materialDark}>
              {updateTweetExample}
            </SyntaxHighlighter>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Delete Tweet Section */}
      <Accordion>
        <AccordionSummary expandIcon={<AiOutlineDown style={{ fontSize: 24 }} />}>
          <Typography variant="h6">
            <MdDelete style={{ marginRight: 8 }} />
            Delete a Tweet
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">
            <strong>Endpoint:</strong> POST /api/public/tweet/delete_tweet
          </Typography>
          <Typography variant="body1">
            <strong>Headers:</strong>
            <ul>
              <li>x-api-key: Your API Key</li>
            </ul>
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Guidelines:</strong> To delete a tweet, send a DELETE request to the endpoint with an x-api-key in the request headers for authentication. Include the tweetId in the URL path
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Sample Request:</strong>
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="javascript" style={materialDark}>
              {deleteTweet}
            </SyntaxHighlighter>
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(deleteTweet)}
          >
            Copy Request Code
          </Button>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Response:</strong>
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SyntaxHighlighter language="json" style={materialDark}>
              {deleteTweetExample}
            </SyntaxHighlighter>
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* API Key Section */}
      {apiKey &&
      <Box sx={{ mt: 1 }}>
      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Your API Key
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              fontWeight: "bold",
              wordWrap: "break-word",
              mb: 2,
              px: 1,
            }}
          >
            {apiKey}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                px: 3,
                py: 1,
                background: "linear-gradient(90deg, #6a11cb, #2575fc)",
                color: "#fff",
                ":hover": {
                background: "linear-gradient(90deg, #2575fc, #6a11cb)",
              },
              }}
              onClick={() => navigator.clipboard.writeText(apiKey)}
            >
              Copy API Key
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
    }

    </Container>
  );
};

export default ApiDocs;