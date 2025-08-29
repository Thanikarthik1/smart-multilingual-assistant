from llama_cpp import Llama

# Load the model from your E drive
llm = Llama(
    model_path="E:/llm/models/mistral-7b-instruct-v0.1.Q5_K_M.gguf",
    n_ctx=2048,
    n_threads=8,
    use_mlock=False,
)

# Run a simple test prompt
output = llm("Q: What is the capital of France?\nA:", max_tokens=50)

# Print the result
print(output["choices"][0]["text"].strip())
