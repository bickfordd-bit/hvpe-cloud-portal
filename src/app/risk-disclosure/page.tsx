export default function RiskDisclosurePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Risk Disclosure</h1>
        <p className="text-gray-300 mb-4">
          Trading financial instruments, including stocks, options, futures, and
          digital assets, involves significant risk of loss and is not suitable
          for every investor.
        </p>
        <p className="text-gray-300 mb-4">
          Past performance of HVPE or any trading strategy does not guarantee
          future results. You may lose some or all of your capital. You should
          carefully consider your financial situation, risk tolerance, and
          investment objectives before using HVPE.
        </p>
        <p className="text-gray-300 mb-4">
          By using HVPE, you acknowledge that you understand these risks and
          accept full responsibility for your trading decisions.
        </p>
        <p className="text-gray-500 mt-8 text-sm">
          This disclosure is for informational purposes only and may be updated
          without notice.
        </p>
      </div>
    </main>
  );
}
