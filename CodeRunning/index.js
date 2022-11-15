// create a new express app
require('dotenv').config();
const axios = require("axios");
const express = require("express");
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
const convertToString = (base64) => {
    if (base64 === null) return "";
    if (base64 === undefined) return "";
    if (base64 === "") return "";
    console.log(base64);
    const base64Decode = Buffer.from(base64, "base64");
    return base64Decode.toString();
}


const convertToBase64 = (str) => {
    if (str === null) return "";
    if (str === undefined) return "";
    if (str === "") return "";
    const buf = Buffer.from(str, "utf8");
    const base64Encode = buf.toString("base64");
    return base64Encode;
};


const getSubmission = async (submissionId) => {
    try {
        const url = process.env.JUDGE0_SUBMISSION_URL;
        const tokenKey = process.env.X_RapidAPI_Key;
        const options = {
            method: 'GET',
            url: url + '/' + submissionId,
            params: { base64_encoded: 'true', fields: '*' },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': tokenKey,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
        };
        const response = await axios.request(options);
        return response.data;
    } catch (err) {
        console.log(err);
        return "Error";
    }
};

app.get('/', (req, res) => {
    res.send("Welcome to CodeRunning API");
})

app.post("/runCode", async (req, res) => {

    try {
        const { code, language_id, input } = req.body;
        console.log(req.body)
        const encodedCode = convertToBase64(code);
        const encodedStdin = convertToBase64(input);
        const url = process.env.JUDGE0_SUBMISSION_URL;
        const tokenKey = process.env.X_RapidAPI_Key;
        const options = {
            method: 'POST',
            url: url,
            params: { base64_encoded: 'true', fields: '*' },
            headers: {
                'content-type': 'application/json',
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': tokenKey,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: {
                language_id: language_id,
                source_code: encodedCode,
                stdin: encodedStdin
            }
        };

        const result = await axios.request(options);
        console.log(result)
        const { token } = result.data;
        const submissionId = token;
        const submissionResult = await getSubmission(submissionId);
        if (submissionResult === "Error") {
            res.status(500).send("Error");
            return;
        }
        const { stdout, stderr, compile_output, status, message } = submissionResult;
        const decodedStdout = convertToString(stdout);
        const decodedStderr = convertToString(stderr);
        const decodedCompileOutput = convertToString(compile_output);
        const decodedMessage = convertToString(message);
        const response = {
            stdout: decodedStdout,
            stderr: decodedStderr,
            compile_output: decodedCompileOutput,
            status: status,
            message: decodedMessage
        }

        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        const code = error.config.data.split('"')[3];
        console.log(code)
        console.log("error", convertToString(code));
        res.status(500).send("error");
    }
})


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});











