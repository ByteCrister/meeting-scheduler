import styles from '../styles/LoadingUIBlackBullfrog.module.css';
const LoadingUIBlackBullfrog = () => {
  return (
    <div className='fixed inset-0 z-[9999] bg-opacity-50 flex items-center justify-center'>
      <div className={styles.spinner + ' ' + styles.center}>
        {
          Array.from({ length: 12 }).map((_, index) => {
            return <div key={index} className={styles["spinner-blade"]}></div>
          })
        }
      </div>
    </div>
  )
}

export default LoadingUIBlackBullfrog