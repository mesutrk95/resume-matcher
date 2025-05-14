import { LottieAnimatedIcon } from '@/app/_components/lottie-animated-icon';
import { Button } from '@/components/ui/button';
import { JobResumeStatusFlags, JobResumeStatusFlagState } from '@/types/job-resume';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsDown, LucideCheckCircle, LucideLoaderCircle } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

// import { LottieAnimatedIcon } from '@/app/_components/lottie-animated-icon';
// import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Define the ref interface
export interface ResumeBuilderAssistantRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// Define the props interface
interface ResumeBuilderAssistantProps {
  // Add any props you might need
  statusFlags?: JobResumeStatusFlags;
  onVisibilityChange?: (isVisible: boolean) => void;
}

const AnalyzingItem = ({
  state,
  text,
  loadingText,
}: {
  state?: JobResumeStatusFlagState;
  text: string;
  loadingText: string;
}) => {
  const loading = state === 'pending';
  return (
    <div className={clsx('flex space-x-1 items-center', loading ? '' : 'text-green-600')}>
      {loading ? (
        <LucideLoaderCircle className="animate-spin" size={14} />
      ) : (
        <LucideCheckCircle className="" size={14} />
      )}
      <span>{loading ? loadingText : text}</span>
    </div>
  );
};

export const ResumeBuilderAssistant = forwardRef<
  ResumeBuilderAssistantRef,
  ResumeBuilderAssistantProps
>(({ onVisibilityChange, statusFlags }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNoticed, setIsNoticied] = useState(false);

  // Expose methods to parent through ref
  useImperativeHandle(ref, () => ({
    open: () => setIsVisible(true),
    close: () => setIsVisible(false),
    toggle: () => setIsVisible(prev => !prev),
  }));

  // Function to toggle visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Call the callback when visibility changes
  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isVisible);
    }
  }, [isVisible, onVisibilityChange]);

  // Animation variants for the container
  const containerVariants = {
    initial: {
      width: '40px',
      height: '0px',
      opacity: 0,
      left: 0,
    },
    widthExpanded: {
      width: '100%',
      opacity: 1,
      transition: {
        duration: 0.14,
        opacity: { duration: 0.2 },
      },
    },
    fullyExpanded: {
      height: 'auto',
      transition: {
        delay: 0.14,
        duration: 0.14,
      },
    },
    exit: {
      height: '0px',
      opacity: 0,
      transition: {
        duration: 0.14,
        opacity: { duration: 0.2 },
      },
      transitionEnd: {
        width: '40px',
        transition: {
          duration: 0.14,
        },
      },
    },
  };

  // Animation variants for the content
  const contentVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.28,
        duration: 0.14,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.14,
      },
    },
  };

  const analying =
    statusFlags?.analyzingEducations === 'pending' ||
    statusFlags?.analyzingExperiences === 'pending' ||
    statusFlags?.analyzingProjects === 'pending' ||
    statusFlags?.analyzingSummaries === 'pending';

  useEffect(() => {
    if (analying) {
      setIsVisible(true);
      setIsNoticied(true);
    }
  }, [analying]);

  return (
    <div className="sticky bottom-0 left-0 w-full ">
      <div className="px-5">
        <div
          className={clsx(
            'flex justify-start ease-in-out',
            !isVisible && !isNoticed && 'animate-bounce duration-800 ',
          )}
        >
          <motion.div
            animate={
              {
                // scale: isVisible ? 0.8 : 1,
                // opacity: isVisible ? 0.9 : 1,
              }
            }
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="warning"
              onClick={toggleVisibility}
              size={isVisible ? 'icon' : 'icon-lg'}
              className={clsx(
                `origin-center rounded-full transition-all relative z-10`,
                isVisible
                  ? 'ms-4 rounded-b-none bg-linear-to-t/oklab to-orange-400 from-orange-200'
                  : 'ms-2 mb-2 shadow-2xl',
              )}
            >
              {isVisible ? (
                <ChevronsDown className="h-10 w-10" />
              ) : (
                <>
                  <LottieAnimatedIcon
                    width={30}
                    height={30}
                    icon="/iconly/Ai19-white.json"
                    autoPlay={analying}
                  />
                  {/* <BadgeHelp className="h-10 w-10" />
                  <span
                    className="badge bg-red-500 rounded-full absolute -top-2 -left-2 p-2 px-3 leading-none text-xs
"
                  >
                    2
                  </span> */}
                </>
              )}
            </Button>
          </motion.div>
        </div>
        {/* The expandable panel */}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="bg-white border-2 border-b-0 border-orange-200 rounded-xl rounded-b-none shadow-2xl overflow-hidden"
              initial="initial"
              animate={['widthExpanded', 'fullyExpanded']}
              exit="exit"
              variants={containerVariants}
            >
              <div className="p-4 ">
                <motion.div
                  className="flex flex-col h-full"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={contentVariants}
                >
                  <div className="flex-grow px-2 py-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-gray-900 font-bold">AI Resume Assistant</h3>
                    </div>
                    <div className="mt-  flex-1">
                      <p className="text-sm text-gray-600 mb-4">
                        Resume is not analyzed yet, analyze it now and get the improvement points!
                      </p>
                      <div className="flex flex-col space-y-1 my-4 text-xs">
                        <AnalyzingItem
                          state={statusFlags?.analyzingExperiences}
                          loadingText="Analyzing Experiences ..."
                          text="Experiences Analyzed."
                        />
                        <AnalyzingItem
                          state={statusFlags?.analyzingProjects}
                          loadingText="Analyzing Projects ..."
                          text="Projects Analyzed."
                        />
                        <AnalyzingItem
                          state={statusFlags?.analyzingSummaries}
                          loadingText="Analyzing Summaries ..."
                          text="Summaries Analyzed."
                        />
                      </div>
                      {/* <div className=" ">
                        <Button variant="warning" size={'sm'}>
                          Analyze Now
                        </Button> 
                      </div> */}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
