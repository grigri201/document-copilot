export default function Home() {
  return (
    <div className="relative min-h-screen p-4">
      <div
        contentEditable
        suppressContentEditableWarning
        className="border p-4 min-h-[200px]"
      >
        Editable content
      </div>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 flex w-[80%] items-center">
        <input
          type="text"
          className="flex-grow bg-transparent border rounded p-2"
        />
        <button className="ml-2 bg-blue-600 text-white rounded px-4 py-2">
          Send
        </button>
      </div>
    </div>
  );
}
