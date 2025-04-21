"use client";

import styles from '../styles/LoadingUi.module.css';

const LoadingUi = () => {
    return (
        <div className='h-screen w-full flex flex-col items-center'>
            <section className={styles["dots-container"]}>
                {
                    Array.from({ length: 5 }).map((_, index) => {
                        return <div key={index} className={styles.dot}></div>
                    })
                }
            </section>
        </div>
    );
};

export default LoadingUi;