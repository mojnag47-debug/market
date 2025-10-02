import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string };
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/featured');
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        setError('خطا در دریافت اطلاعات محصولات');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>تلاش مجدد</button>
      </div>
    );
  }

  return (
    <div className={styles['page']} dir="rtl">
      <header className={styles['header']}>
        <div className={styles['container']}>
          <div className={styles['logo']}>
            <h1>🛒 بازارچه نکست‌جن</h1>
            <p className={styles['tagline']}>بزرگترین مارکت‌پلیس هوشمند ایران</p>
          </div>
          <nav className={styles['nav']}>
            <a href="#">خانه</a>
            <a href="#">دسته‌بندی‌ها</a>
            <a href="#">فروشندگان</a>
            <a href="#">پیشنهادات ویژه</a>
          </nav>
          <div className={styles['userActions']}>
            <button className={styles['searchBtn']}>🔍</button>
            <button className={styles['cartBtn']}>🛒</button>
            <button className={styles['userBtn']}>👤</button>
          </div>
        </div>
      </header>

      <main className={styles['main']}>
        <section className={styles['hero']}>
          <div className={styles['container']}>
            <div className={styles['heroContent']}>
              <h2>خوش آمدید به آینده خرید آنلاین!</h2>
              <p>با هوش مصنوعی پیشرفته، بهترین محصولات را برای شما پیشنهاد می‌دهیم.</p>
              <div className={styles['heroFeatures']}>
                <div className={styles['feature']}>
                  <span className={styles['featureIcon']}>🤖</span>
                  <div>
                    <h3>پیشنهادات هوشمند</h3>
                    <p>محصولاتی که واقعاً نیاز دارید</p>
                  </div>
                </div>
                <div className={styles['feature']}>
                  <span className={styles['featureIcon']}>💳</span>
                  <div>
                    <h3>پرداخت امن با زرین‌پال</h3>
                    <p>تراکنش‌های امن و سریع</p>
                  </div>
                </div>
                <div className={styles['feature']}>
                  <span className={styles['featureIcon']}>🚚</span>
                  <div>
                    <h3>ارسال سریع</h3>
                    <p>تحویل در کمترین زمان ممکن</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['categories']}>
          <div className={styles['container']}>
            <h2>دسته‌بندی‌های محبوب</h2>
            <div className={styles['categoryGrid']}>
              <div className={styles['categoryCard']}>
                <span className={styles['categoryIcon']}>📱</span>
                <h3>موبایل و تبلت</h3>
                <p>جدیدترین گوشی‌ها و تبلت‌ها</p>
              </div>
              <div className={styles['categoryCard']}>
                <span className={styles['categoryIcon']}>💻</span>
                <h3>لپ‌تاپ و کامپیوتر</h3>
                <p>دستگاه‌های قدرتمند برای کار</p>
              </div>
              <div className={styles['categoryCard']}>
                <span className={styles['categoryIcon']}>👕</span>
                <h3>مد و پوشاک</h3>
                <p>لباس‌های شیک و راحت</p>
              </div>
              <div className={styles['categoryCard']}>
                <span className={styles['categoryIcon']}>🏠</span>
                <h3>خانه و آشپزخانه</h3>
                <p>وسایل و تجهیزات منزل</p>
              </div>
              <div className={styles['categoryCard']}>
                <span className={styles['categoryIcon']}>📚</span>
                <h3>کتاب و لوازم‌التحریر</h3>
                <p>کتاب‌های جدید و مفید</p>
              </div>
              <div className={styles['categoryCard']}>
                <span className={styles['categoryIcon']}>⚽</span>
                <h3>ورزش و سرگرمی</h3>
                <p>تجهیزات ورزشی و بازی</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['features']}>
          <div className={styles['container']}>
            <h2>چرا بازارچه نکست‌جن؟</h2>
            <div className={styles['featuresList']}>
              <div className={styles['featureItem']}>
                <h3>🎯 پیشنهادات شخصی‌سازی شده</h3>
                <p>الگوریتم‌های پیشرفته هوش مصنوعی برای ارائه بهترین پیشنهادات</p>
              </div>
              <div className={styles['featureItem']}>
                <h3>⚡ سرعت و کارایی بالا</h3>
                <p>تکنولوژی‌های مدرن برای تجربه‌ای سریع و روان</p>
              </div>
              <div className={styles['featureItem']}>
                <h3>🔒 امنیت تضمین شده</h3>
                <p>حفاظت کامل از اطلاعات شخصی و مالی شما</p>
              </div>
              <div className={styles['featureItem']}>
                <h3>📊 تحلیل‌های هوشمند فروشنده</h3>
                <p>ابزارهای پیشرفته برای بهینه‌سازی فروش</p>
              </div>
              <div className={styles['featureItem']}>
                <h3>🌐 پشتیبانی کامل از زبان فارسی</h3>
                <p>رابط کاربری بهینه‌شده برای کاربران ایرانی</p>
              </div>
              <div className={styles['featureItem']}>
                <h3>💎 تجربه کاربری درجه یک</h3>
                <p>طراحی زیبا و کاربردی برای آسانی خرید</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['cta']}>
          <div className={styles['container']}>
            <div className={styles['ctaContent']}>
              <h2>آماده برای شروع هستید؟</h2>
              <p>همین امروز عضو بزرگترین مارکت‌پلیس هوشمند ایران شوید</p>
              <div className={styles['ctaButtons']}>
                <button className={styles['primaryBtn']}>ثبت‌نام کنید</button>
                <button className={styles['secondaryBtn']}>بیشتر بدانید</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles['footer']}>
        <div className={styles['container']}>
          <div className={styles['footerContent']}>
            <div className={styles['footerSection']}>
              <h3>بازارچه نکست‌جن</h3>
              <p>مارکت‌پلیس هوشمند برای آینده تجارت الکترونیک</p>
            </div>
            <div className={styles['footerSection']}>
              <h3>خدمات</h3>
              <ul>
                <li><a href="#">فروش محصول</a></li>
                <li><a href="#">پنل فروشنده</a></li>
                <li><a href="#">مدیریت سفارشات</a></li>
              </ul>
            </div>
            <div className={styles['footerSection']}>
              <h3>پشتیبانی</h3>
              <ul>
                <li><a href="#">تماس با ما</a></li>
                <li><a href="#">سوالات متداول</a></li>
                <li><a href="#">راهنمای خرید</a></li>
              </ul>
            </div>
            <div className={styles['footerSection']}>
              <h3>درباره ما</h3>
              <ul>
                <li><a href="#">داستان ما</a></li>
                <li><a href="#">فرصت‌های شغلی</a></li>
                <li><a href="#">تماس با ما</a></li>
              </ul>
            </div>
          </div>
          <div className={styles['footerBottom']}>
            <p>© ۱۴۰۳ بازارچه نکست‌جن. تمامی حقوق محفوظ است.</p>
            <p>پرداخت امن با زرین‌پال | SSL تضمین شده</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
