import { Suspense } from 'react';
import Link from 'next/link';
import styles from '../page.module.css';

export default function Dashboard() {
  return (
    <div className={styles.container} dir="rtl">
      <h1 className={styles.dashboardTitle}>پنل مدیریت فروشنده</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>💰 فروش امروز</h3>
          <p className={styles.statValue}>۱۲,۴۵۰,۰۰۰ تومان</p>
          <div className={styles.statTrend}>↑ ۱۸% نسبت به دیروز</div>
        </div>
        
        <div className={styles.statCard}>
          <h3>📦 سفارشات جدید</h3>
          <p className={styles.statValue}>۲۳ سفارش</p>
          <div className={styles.statTrend}>۳ مورد نیاز به تایید</div>
        </div>
        
        <div className={styles.statCard}>
          <h3>⭐ امتیاز فروشگاه</h3>
          <p className={styles.statValue}>۴.۸ از ۵</p>
          <div className={styles.statTrend}>۱۵ نظر جدید</div>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>آخرین سفارشات</h2>
        <div className={styles.orderList}>
          {/* Placeholder for orders list */}
          <div className={styles.orderItem}>
            <span>#۱۲۳۴۵</span>
            <span>در حال پردازش</span>
            <span>۱,۲۳۰,۰۰۰ تومان</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>مدیریت محصولات</h2>
        <Link href="/dashboard/products/new" className={styles.addProductButton}>
          ＋ افزودن محصول جدید
        </Link>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>آمار فروش هفتگی</h2>
        <div className={styles.chartContainer}>
          {/* Placeholder for sales chart */}
          <div className={styles.chartPlaceholder}>
            نمودار فروش
          </div>
        </div>
      </section>
    </div>
  );
}