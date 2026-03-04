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
                <span className="text-white text-btn-sm">H</span>
              </div>
              Hearty
            </Link>
            <p className="mt-3 text-body-sm text-neutral-700">
              {"Подбор психологов и коучей по совпадению ценностей с помощью ИИ"}
            </p>
          </div>

          {/* Clients */}
          <div>
            <h3 className="text-heading-6 text-neutral-900 mb-4">
              {"Клиентам"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/catalog"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"Каталог"}
                </Link>
              </li>
              <li>
                <Link
                  href="/consultation"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"ИИ-консультация"}
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
              {"Специалистам"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/specialist/register"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"Регистрация"}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"Тарифы"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-heading-6 text-neutral-900 mb-4">
              {"Компания"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"О нас"}
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"Контакты"}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"Политика конфиденциальности"}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-body-sm text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  {"Условия использования"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-300 pt-6 text-center">
          <p className="text-caption text-neutral-600">
            {"© 2026 Hearty. Все права защищены."}
          </p>
          <p className="mt-1 text-caption text-neutral-500">
            {"Сервис не является медицинским учреждением."}
          </p>
        </div>
      </div>
    </footer>
  );
}
