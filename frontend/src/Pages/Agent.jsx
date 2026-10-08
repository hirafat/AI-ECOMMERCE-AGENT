import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Send } from "lucide-react";
import { askAgent } from "../api";

function Agent() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  // =========================
  // VOICE INPUT
  // =========================
  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setMessage((prev) =>
        prev
          ? `${prev} ${transcript}`
          : transcript
      );
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSend = async () => {
    console.log("HANDLE SEND RUNNING");

    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    const command = userMessage.toLowerCase();

    console.log("USER MESSAGE:", userMessage);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");

    // =========================
    // NAVIGATION
    // =========================

    if (
      command.includes("open products") ||
      command.includes("show products") ||
      command.includes("go to products") ||
      command.includes("products kholo") ||
      command.includes("product kholo")
    ) {
      navigate("/products");
      return;
    }

    if (
      command.includes("open orders") ||
      command.includes("show orders") ||
      command.includes("go to orders") ||
      command.includes("orders kholo") ||
      command.includes("order kholo")
    ) {
      navigate("/orders");
      return;
    }

    if (
      command.includes("open customers") ||
      command.includes("show customers") ||
      command.includes("go to customers") ||
      command.includes("customers kholo") ||
      command.includes("customer kholo")
    ) {
      navigate("/customers");
      return;
    }

    if (
      command.includes("open analytics") ||
      command.includes("show analytics") ||
      command.includes("go to analytics") ||
      command.includes("analytics kholo")
    ) {
      navigate("/analytics");
      return;
    }

    if (
      command.includes("open dashboard") ||
      command.includes("show dashboard") ||
      command.includes("go to dashboard") ||
      command.includes("dashboard kholo")
    ) {
      navigate("/dashboard");
      return;
    }

    // =========================
    // AI AGENT
    // =========================

    setLoading(true);

    try {
      console.log("Calling AI Agent...");

      const data = await askAgent(userMessage);

      console.log("AGENT API RESPONSE:", data);
      console.log("CUSTOMERS:", data?.customers);
      console.log("ORDERS:", data?.orders);
      console.log("PRODUCTS:", data?.products);

      let aiResponse = data?.response || "";

      if (
        typeof aiResponse === "object" &&
        aiResponse !== null
      ) {
        aiResponse =
          aiResponse.text ||
          aiResponse.content ||
          JSON.stringify(aiResponse);
      }

      if (!aiResponse) {
        aiResponse =
          "Sorry, I could not generate a response.";
      }

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: String(aiResponse),

          orders: Array.isArray(data?.orders)
            ? data.orders
            : [],

          customers: Array.isArray(data?.customers)
            ? data.customers
            : [],

          products: Array.isArray(data?.products)
            ? data.products
            : [],
        },
      ]);
    } catch (error) {
      console.error("AGENT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong while connecting to the AI agent.",
          orders: [],
          customers: [],
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            AI Agent
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Ask your AI agent to manage your e-commerce operations.
          </p>
        </div>

        <div
          className={`flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            listening
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-gray-800 bg-gray-900 text-gray-300"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              listening
                ? "animate-pulse bg-red-500"
                : "bg-green-500"
            }`}
          />

          {listening
            ? "Listening..."
            : "Agent Online"}
        </div>
      </div>

      {/* =========================
          CHAT CONTAINER
      ========================= */}

      <div className="flex h-[650px] w-full flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">

        {/* =========================
            MESSAGES
        ========================= */}

        <div className="flex-1 overflow-y-auto">

          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-2xl">
                🤖
              </div>

              <h2 className="text-2xl font-semibold text-white">
                How can I help?
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-gray-400">
                Ask me about orders, products, customers, or your store analytics.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">

                <button
                  onClick={() =>
                    setMessage(
                      "How many products do we have?"
                    )
                  }
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
                >
                  Total Products
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "How many pending orders are there?"
                    )
                  }
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
                >
                  Pending Orders
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "What are our total sales?"
                    )
                  }
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
                >
                  Total Sales
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "Tell me the details of orders"
                    )
                  }
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
                >
                  Order Details
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "Tell me what each customer bought"
                    )
                  }
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
                >
                  Customer Purchases
                </button>

              </div>
            </div>
          ) : (

            <div className="space-y-6 p-6">

              {messages.map((msg, index) => (

                <div key={index}>

                  {/* USER MESSAGE */}

                  {msg.role === "user" && (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white">
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {/* ASSISTANT MESSAGE */}

                  {msg.role === "assistant" && (

                    <div className="flex justify-start">

                      <div className="w-full max-w-[95%]">

                        {/* AI TEXT */}

                        <div className="whitespace-pre-line rounded-2xl rounded-bl-md bg-gray-800 px-4 py-3 text-sm leading-6 text-gray-200">
                          {msg.content}
                        </div>

                        {/* =========================
                            CUSTOMER DETAILS
                        ========================= */}

                        {msg.customers &&
                          msg.customers.length > 0 && (

                            <div className="mt-4 space-y-4">

                              {msg.customers.map(
                                (customer, customerIndex) => (

                                  <div
                                    key={
                                      customer.customer_id ||
                                      customerIndex
                                    }
                                    className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-950"
                                  >

                                    {/* CUSTOMER HEADER */}

                                    <div className="border-b border-gray-800 bg-gray-900 px-5 py-4">

                                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                                        <div>

                                          <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                                            Customer Details
                                          </p>

                                          <h3 className="mt-1 text-xl font-semibold text-white">
                                            {customer.customer_name ||
                                              "Unknown Customer"}
                                          </h3>

                                          <p className="mt-1 text-sm text-gray-500">
                                            Customer #
                                            {customer.customer_id}
                                          </p>

                                        </div>

                                        <div className="rounded-lg bg-blue-600/10 px-4 py-2">

                                          <p className="text-xs text-gray-500">
                                            Total Spent
                                          </p>

                                          <p className="text-lg font-bold text-white">
                                            {customer.total_spent ?? 0}
                                          </p>

                                        </div>

                                      </div>

                                    </div>

                                    {/* CUSTOMER INFORMATION */}

                                    <div className="p-5">

                                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                                        <Info
                                          label="Customer ID"
                                          value={
                                            customer.customer_id
                                          }
                                        />

                                        <Info
                                          label="Name"
                                          value={
                                            customer.customer_name
                                          }
                                        />

                                        <Info
                                          label="Email"
                                          value={
                                            customer.customer_email
                                          }
                                        />

                                        <Info
                                          label="Status"
                                          value={
                                            customer.customer_status
                                          }
                                        />

                                        <Info
                                          label="Total Orders"
                                          value={
                                            customer.total_orders
                                          }
                                        />

                                        <Info
                                          label="Total Spent"
                                          value={
                                            customer.total_spent
                                          }
                                        />

                                      </div>

                                      {/* PURCHASE HISTORY */}

                                      <div className="mt-6 border-t border-gray-800 pt-5">

                                        <h4 className="mb-4 text-base font-semibold text-white">
                                          Purchase History
                                        </h4>

                                        {customer.purchases &&
                                        customer.purchases.length > 0 ? (

                                          <div className="space-y-3">

                                            {customer.purchases.map(
                                              (
                                                purchase,
                                                purchaseIndex
                                              ) => (

                                                <div
                                                  key={
                                                    purchase.order_id ||
                                                    purchaseIndex
                                                  }
                                                  className="rounded-xl border border-gray-800 bg-gray-900 p-4"
                                                >

                                                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                                                    <div>

                                                      <p className="text-base font-semibold text-white">
                                                        {purchase.product_name ||
                                                          "Unknown Product"}
                                                      </p>

                                                      <p className="mt-1 text-xs text-gray-500">
                                                        Order #
                                                        {
                                                          purchase.order_id
                                                        }
                                                      </p>

                                                    </div>

                                                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">

                                                      <Info
                                                        label="Product ID"
                                                        value={
                                                          purchase.product_id
                                                        }
                                                      />

                                                      <Info
                                                        label="Quantity"
                                                        value={
                                                          purchase.quantity
                                                        }
                                                      />

                                                      <Info
                                                        label="Total Price"
                                                        value={
                                                          purchase.total_price
                                                        }
                                                      />

                                                      <Info
                                                        label="Status"
                                                        value={
                                                          purchase.status
                                                        }
                                                      />

                                                    </div>

                                                  </div>

                                                  {purchase.created_at && (
                                                    <p className="mt-3 border-t border-gray-800 pt-3 text-xs text-gray-500">
                                                      Order Date:{" "}
                                                      {new Date(
                                                        purchase.created_at
                                                      ).toLocaleString()}
                                                    </p>
                                                  )}

                                                </div>

                                              )
                                            )}

                                          </div>

                                        ) : (

                                          <p className="text-sm text-gray-500">
                                            This customer has no purchases yet.
                                          </p>

                                        )}

                                      </div>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>
                          )}

                        {/* =========================
                            ORDER CARDS
                        ========================= */}

                        {msg.orders &&
                          msg.orders.length > 0 && (

                            <div className="mt-4 space-y-3">

                              {msg.orders.map(
                                (order, orderIndex) => (

                                  <div
                                    key={
                                      order.order_id ||
                                      orderIndex
                                    }
                                    className="rounded-xl border border-gray-700 bg-gray-950 p-5"
                                  >

                                    <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-3">

                                      <h3 className="font-semibold text-white">
                                        Order #
                                        {order.order_id}
                                      </h3>

                                      <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                          String(
                                            order.status
                                          ).toLowerCase() ===
                                          "pending"
                                            ? "bg-yellow-500/10 text-yellow-400"
                                            : "bg-green-500/10 text-green-400"
                                        }`}
                                      >
                                        {order.status}
                                      </span>

                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                      <Info
                                        label="Product"
                                        value={
                                          order.product_name ||
                                          `Product #${order.product_id}`
                                        }
                                      />

                                      <Info
                                        label="Customer"
                                        value={
                                          order.customer_name ||
                                          `Customer #${order.customer_id}`
                                        }
                                      />

                                      <Info
                                        label="Quantity"
                                        value={
                                          order.quantity
                                        }
                                      />

                                      <Info
                                        label="Total Price"
                                        value={
                                          order.total_price
                                        }
                                      />

                                      <Info
                                        label="Customer Email"
                                        value={
                                          order.customer_email
                                        }
                                      />

                                      <Info
                                        label="Created At"
                                        value={
                                          order.created_at
                                            ? new Date(
                                                order.created_at
                                              ).toLocaleString()
                                            : "N/A"
                                        }
                                      />

                                    </div>

                                  </div>

                                )
                              )}

                            </div>
                          )}

                        {/* =========================
                            PRODUCT CARDS
                        ========================= */}

                        {msg.products &&
                          msg.products.length > 0 && (

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                              {msg.products.map(
                                (
                                  product,
                                  productIndex
                                ) => (

                                  <div
                                    key={
                                      product.product_id ||
                                      product.id ||
                                      productIndex
                                    }
                                    className="rounded-xl border border-gray-700 bg-gray-950 p-5"
                                  >

                                    <h3 className="font-semibold text-white">
                                      {product.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                      Product #
                                      {
                                        product.product_id ||
                                        product.id
                                      }
                                    </p>

                                    <p className="mt-3 text-sm text-gray-400">
                                      {product.description ||
                                        "No description"}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">

                                      <span className="text-lg font-semibold text-white">
                                        {product.price}
                                      </span>

                                      <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
                                        {product.category ||
                                          "General"}
                                      </span>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>
                          )}

                      </div>

                    </div>
                  )}

                </div>

              ))}

              {/* LOADING */}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gray-800 px-4 py-3 text-sm text-gray-400">
                    AI is thinking...
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* =========================
            INPUT AREA
        ========================= */}

        <div className="border-t border-gray-800 bg-gray-900 p-4">

          <div className="flex w-full items-center gap-3">

            {/* INPUT */}

            <div className="relative min-w-0 flex-1">

              <input
                type="text"
                placeholder={
                  listening
                    ? "Listening..."
                    : "Ask your AI agent..."
                }
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 disabled:opacity-50"
              />

              {/* MIC */}

              <button
                type="button"
                onClick={startVoiceInput}
                disabled={loading}
                title={
                  listening
                    ? "Stop listening"
                    : "Speak"
                }
                className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition ${
                  listening
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {listening ? (
                  <MicOff size={19} />
                ) : (
                  <Mic size={19} />
                )}
              </button>

            </div>

            {/* SEND */}

            <button
              type="button"
              onClick={handleSend}
              disabled={
                loading || !message.trim()
              }
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={17} />

              <span className="hidden sm:inline">
                {loading
                  ? "Sending..."
                  : "Send"}
              </span>
            </button>

          </div>

          {listening && (
            <p className="mt-2 text-center text-xs text-red-400">
              Speak now...
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

// =========================
// REUSABLE INFO COMPONENT
// =========================

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-gray-200">
        {value ?? "N/A"}
      </p>
    </div>
  );
}

export default Agent;