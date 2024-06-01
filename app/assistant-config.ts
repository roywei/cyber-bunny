export let assistantId = "asst_7N1MzYtCpmX0NFfz3tsUIjnj"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
