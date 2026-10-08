from app.agents.ecommerce_agent import ask_ecommerce_agent


if __name__ == "__main__":
    question = input("Ask your AI Agent: ")

    answer = ask_ecommerce_agent(question)

    print("\nAI Agent:")
    print(answer)