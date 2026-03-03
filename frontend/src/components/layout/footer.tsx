import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-300 bg-white">
      <div className="mx-auto max-w-container px-4 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-heading-5 font-bold text-primary-900"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white text-btn-sm">SM</span>
              </div>
              SoulMate
            </Link>
            <p className="mt-3 text-body-sm text-neutral-700">
              {"\u041F\u043E\u0434\u0431\u043E\u0440 \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u043E\u0432 \u0438 \u043A\u043E\u0443\u0447\u0435\u0439 \u043F\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u044E \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0435\u0439 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u0418\u0418"}
            </p>
          </div>

          {/* Clients */}
          <div>
            <h3 className="text-heading-6 text-neutral-900 mb-4">
              {"\u041A\u043B\u0438\u0435\u043D\u0442\u0430\u043C"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/catalog"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"\u041A\u0430\u0442\u0430\u043B\u043E\u0433"}
                </Link>
              </li>
              <li>
                <Link
                  href="/consultation"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"\u0418\u0418-\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044F"}
                </Link>
              </li>
              <li>
                <Link
                  href="/premium"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  Premium
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialists */}
          <div>
            <h3 className="text-heading-6 text-neutral-900 mb-4">
              {"\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u0430\u043C"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/specialist/register"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F"}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"\u0422\u0430\u0440\u0438\u0444\u044B"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-heading-6 text-neutral-900 mb-4">
              {"\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"\u041E \u043D\u0430\u0441"}
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B"}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438"}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-300 pt-6 text-center">
          <p className="text-caption text-neutral-600">
            {"\u00A9 2026 SoulMate. \u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B."}
          </p>
          <p className="mt-1 text-caption text-neutral-500">
            {"\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0441\u043A\u0438\u043C \u0443\u0447\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435\u043C."}
          </p>
        </div>
      </div>
    </footer>
  );
}
